# Robust photo upload for watering events — implementation steps

Goal: survive brief network interruptions (e.g. WIFI→cellular handoff) during
photo upload, avoid orphaned DB rows, and never make the user re-select a
photo after a failed submit.

Decisions locked in (see conversation for rationale):
- On upload failure, **fail the whole submission** (no DB row created) rather
  than saving the event without a photo.
- Retry both the R2/S3 `PutObject` call (server-side) **and** the whole
  form submission (client-side) on transient failures.
- Keep the photo available for retry by **not tearing down the dialog/form**
  on failure (the file already lives in memory in the superforms file
  proxy — we just need to stop hiding/discarding it).
- Apply to all 3 photo upload paths: `water`, `editPlant`/`editEvent`, and
  `newPlant`.

Out of scope (confirmed with user): fixing the unrelated broken
`replaceImage` test in `tests/imageUpload.test.ts`, offline/service-worker
background sync, and orphaned-R2-image cleanup on DB failure after a
successful upload.

---

## Step 1 — Add a retry helper and use it in `uploadImageFile`

**File: `src/lib/uploadImage.ts`**

1. Add a small retry utility near the top of the file (or in a new
   `src/lib/utils/retry.ts` if you prefer it reusable/testable in isolation —
   recommended so it's easy to unit test):

```ts
// src/lib/utils/retry.ts
export interface RetryOptions {
	attempts?: number
	baseDelayMs?: number
	isRetryable?: (error: unknown) => boolean
}

const DEFAULT_RETRYABLE_CODES = new Set([
	'ETIMEDOUT',
	'ECONNRESET',
	'ECONNREFUSED',
	'EPIPE',
	'ENOTFOUND',
	'EAI_AGAIN',
])

export function isTransientError(error: unknown): boolean {
	const err = error as { code?: string; name?: string; $metadata?: { httpStatusCode?: number } }
	if (err?.code && DEFAULT_RETRYABLE_CODES.has(err.code)) return true
	if (err?.name === 'TimeoutError' || err?.name === 'AbortError') return true
	const status = err?.$metadata?.httpStatusCode
	if (status && status >= 500) return true
	return false
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const attempts = options.attempts ?? 3
	const baseDelayMs = options.baseDelayMs ?? 500
	const isRetryable = options.isRetryable ?? isTransientError

	let lastError: unknown
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error
			const isLastAttempt = attempt === attempts
			if (isLastAttempt || !isRetryable(error)) throw error
			const jitter = Math.random() * 250
			const delay = baseDelayMs * 2 ** (attempt - 1) + jitter
			console.warn(
				`\nTransient error on attempt ${attempt}/${attempts}, retrying in ${Math.round(delay)}ms:`,
				error,
			)
			await sleep(delay)
		}
	}
	throw lastError
}
```

2. In `src/lib/uploadImage.ts`, import and use it:

```ts
import { withRetry } from './utils/retry'

export async function uploadImageFile(image: File | Blob) {
	const arrayBuffer = await image.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)

	const originalName = image.name ?? 'upload'
	const key = `${Date.now()}-${sanitizeFilename(originalName)}`
	const contentType = image.type ?? 'application/octet-stream'

	const command = new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key,
		Body: buffer,
		ContentType: contentType,
	})

	await withRetry(() => s3Client.send(command), { attempts: 3, baseDelayMs: 500 })

	return {
		url: env.R2_BUCKET_BASE_URL + key,
		key: key,
	}
}
```

Leave `deleteImageByKey`/`deleteImageByUrl` as-is (not in scope).

---

## Step 2 — Configure S3Client timeouts so hung requests fail fast

**File: `src/lib/s3Client.ts`**

Without an explicit timeout, a stalled connection (e.g. mid-handoff to
cellular) can hang for the SDK's default duration, eating the whole retry
budget on one attempt. Add a `NodeHttpHandler` with explicit timeouts:

```ts
import { S3Client } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import env from './env'

const s3Client = new S3Client({
	region: 'auto',
	endpoint: env.R2_ENDPOINT,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
	requestHandler: new NodeHttpHandler({
		connectionTimeout: 5000, // fail fast if we can't even connect
		socketTimeout: 15000, // fail fast if the upload stalls mid-transfer
	}),
	maxAttempts: 1, // we handle retries ourselves in uploadImage.ts via withRetry
})

export default s3Client
```

Check `@smithy/node-http-handler` is available (it's a transitive dep of
`@aws-sdk/client-s3`); if TypeScript/bundler complains about resolving it,
add it as an explicit devDependency/dependency:

```bash
npm ls @smithy/node-http-handler
```

If not resolvable, run:

```bash
npm install @smithy/node-http-handler
```

We explicitly set `maxAttempts: 1` on the client so the AWS SDK's own retry
logic doesn't stack with our `withRetry` wrapper (which would multiply delays
unpredictably and make timeout budgeting harder to reason about).

---

## Step 3 — Reorder `water` action: upload before DB write, fail together

**File: `src/routes/[plantId]/+page.server.ts`**

Replace the `water` action (current lines 85-106) with upload-first logic and
a single insert:

```ts
water: async ({ request }) => {
	const form = await superValidate(request, zod(plantEventSchema))

	if (!form.valid) return fail(400, { form })

	let image_url: string | undefined
	if (form.data.image) {
		try {
			const uploaded = await uploadImageFile(form.data.image)
			image_url = uploaded.url
		} catch (error) {
			console.error('\nImage upload error: ', error)
			return fail(500, withFiles({ form }))
		}
	}

	const [insertedWaterEvent] = await db
		.insert(watering_event)
		.values({ ...form.data, image_url })
		.returning()
	if (!insertedWaterEvent) return fail(400, withFiles({ form }))

	return message(form, 'Success...')
},
```

Notes:
- The image upload now happens before any DB write, so a failed upload never
  leaves a "watered but no photo" event behind.
- `withFiles({ form })` is included in the `fail(400, ...)` on insert failure
  too, for consistency (previously it wasn't, but this is a pre-existing
  minor gap worth fixing while you're in this code).

---

## Step 4 — Reorder `editPlant` action

**File: `src/routes/[plantId]/+page.server.ts`** (current lines 108-134)

```ts
editPlant: async ({ request, locals }) => {
	const form = await superValidate(request, zod(editPlantSchema))

	if (!form.valid) return fail(400, withFiles({ form }))

	let image_url: string | undefined
	if (form.data.image) {
		try {
			const uploaded = await uploadImageFile(form.data.image)
			image_url = uploaded.url
		} catch (error) {
			console.error('\nImage upload error: ', error)
			return fail(500, withFiles({ form }))
		}
	}

	const [result] = await db
		.update(plant)
		.set({ ...form.data, ...(image_url ? { image_url } : {}) })
		.where(eq(plant.id, form.data.id))
		.returning()

	if (image_url) {
		await db.insert(watering_event).values({
			plant_id: result.id,
			user_id: locals.user.id,
			image_url,
		})
	}

	return withFiles({ form })
},
```

Note the `...form.data` in `.set()` already includes `image` (the File
object) which drizzle will ignore/error on if passed through — check the
original code: it did `db.update(plant).set(form.data)` without spreading
`image_url`, then a **second** update for `image_url` only in the try block.
To keep this safe and minimal, prefer explicit field lists over spreading
`form.data` if `form.data` contains non-column fields like `image`. Recommended
safer version:

```ts
editPlant: async ({ request, locals }) => {
	const form = await superValidate(request, zod(editPlantSchema))

	if (!form.valid) return fail(400, withFiles({ form }))

	let image_url: string | undefined
	if (form.data.image) {
		try {
			const uploaded = await uploadImageFile(form.data.image)
			image_url = uploaded.url
		} catch (error) {
			console.error('\nImage upload error: ', error)
			return fail(500, withFiles({ form }))
		}
	}

	const { image, ...plantFields } = form.data
	const [result] = await db
		.update(plant)
		.set({ ...plantFields, ...(image_url ? { image_url } : {}) })
		.where(eq(plant.id, form.data.id))
		.returning()

	if (image_url) {
		await db.insert(watering_event).values({
			plant_id: result.id,
			user_id: locals.user.id,
			image_url,
		})
	}

	return withFiles({ form })
},
```

Verify `editPlantSchema`'s shape (`src/lib/zodSchemas/plantSchema.ts`) to
confirm `image` is indeed the only non-column field before doing the
destructure — adjust the excluded field list if there are others (e.g. if
`oldImageUrl` is present in the schema, exclude that too since it's not a
`plant` table column).

---

## Step 5 — Reorder `editEvent` action

**File: `src/routes/[plantId]/+page.server.ts`** (current lines 154-181)

```ts
editEvent: async ({ request }) => {
	const form = await superValidate(request, zod(editEventSchema))

	if (!form.valid) return fail(400, withFiles({ form }))

	let image_url: string | undefined
	if (form.data.image) {
		try {
			const uploaded = await uploadImageFile(form.data.image)
			image_url = uploaded.url
		} catch (error) {
			console.error('\nImage upload error: ', error)
			return fail(500, withFiles({ form }))
		}
	}

	const [result] = await db
		.update(watering_event)
		.set({
			notes: form.data.notes,
			fertilized: form.data.fertilized,
			watered: form.data.watered,
			waitUntil: form.data.waitUntil,
			timestamp: form.data.timestamp,
			...(image_url ? { image_url } : {}),
		})
		.where(eq(watering_event.id, form.data.id))
		.returning()

	return withFiles({ form })
},
```

---

## Step 6 — Reorder `newPlant` action

**File: `src/routes/new/plant/+page.server.ts`**

```ts
newPlant: async ({ request, locals }) => {
	const formData = await request.formData()

	const form = await superValidate(formData, zod(newPlantSchema), {
		allowFiles: true,
	})

	if (!form.valid) return fail(400, withFiles({ form }))

	let image_url: string | undefined
	if (form.data.image) {
		try {
			const uploaded = await uploadImageFile(form.data.image)
			image_url = uploaded.url
		} catch (error) {
			console.error('\nImage upload error: ', error)
			return fail(500, withFiles({ form }))
		}
	}

	const { image, ...plantFields } = form.data
	const [insertedPlant] = await db
		.insert(plant)
		.values({ ...plantFields, ...(image_url ? { image_url } : {}) })
		.returning()
	if (!insertedPlant) return fail(400, withFiles({ form }))

	if (image_url) {
		await db.insert(watering_event).values({
			plant_id: insertedPlant.id,
			user_id: locals.user.id,
			image_url,
		})
	}

	return redirect(302, '/')
},
```

Again, confirm `newPlantSchema`'s exact shape before destructuring `image`
out — check `src/lib/zodSchemas/plantSchema.ts` for the full field list.

---

## Step 7 — Fix `WaterButtonDialog.svelte`: don't close dialog on failure

**File: `src/lib/components/WaterButtonDialog.svelte`** (lines 65-75)

Change:

```ts
onResult: ({ result }) => {
	isSubmitting = false
	dialogOpen = false
	if (result.type === 'success') {
		toast.success(`Successfully watered ${data.plant.name ?? data.plant.species ?? 'plant'}!`)
		createJoyfulFuzzyGurgle()
	} else {
		console.error('result', result)
		toast.error('There was an error.')
	}
},
```

to:

```ts
onResult: ({ result }) => {
	isSubmitting = false
	if (result.type === 'success') {
		dialogOpen = false
		toast.success(`Successfully watered ${data.plant.name ?? data.plant.species ?? 'plant'}!`)
		createJoyfulFuzzyGurgle()
	} else {
		console.error('result', result)
		toast.error('Upload failed. Your photo is still attached — tap Submit to try again.')
	}
},
```

This is the core fix for "the photo should remain so the user doesn't have
to retake it" — `EditButtonDialog.svelte`, `EditWateringEventDialog.svelte`,
and `AddNewPlant.svelte` already only close on success, so no change needed
there. Only `WaterButtonDialog.svelte` had this bug.

---

## Step 8 — Client-side retry of the whole submission on transient failure

**File: `src/lib/components/WaterButtonDialog.svelte`**

superforms' `onError` fires when the `fetch` itself throws (e.g. dropped
connection before reaching the server) — a different failure mode than a
server-returned `fail(500, ...)` (which comes through `onResult` with
`result.type === 'failure'`/`'error'`). We want to auto-retry both cases a
couple of times before bothering the user.

1. Add retry-tracking state near the other `$state` declarations:

```ts
let retryCount = $state(0)
const MAX_CLIENT_RETRIES = 2
const RETRY_DELAYS_MS = [1000, 3000]
```

2. Update the `superForm` options to capture `submit` and add `onError`:

```ts
const { form, enhance, errors, message, constraints, submit } = superForm(data.waterForm, {
	invalidateAll: 'force',
	onSubmit: () => {
		isSubmitting = true
	},
	onError: ({ result }) => {
		// Network-level failure (fetch threw) — result.error is the thrown error
		void handleTransientFailure()
	},
	onResult: ({ result }) => {
		if (result.type === 'success') {
			isSubmitting = false
			retryCount = 0
			dialogOpen = false
			toast.success(`Successfully watered ${data.plant.name ?? data.plant.species ?? 'plant'}!`)
			createJoyfulFuzzyGurgle()
		} else if (result.type === 'failure' && result.status === 500) {
			// Server-side failure after it exhausted its own upload retries — safe to
			// retry the whole submission because our server actions now upload the
			// image BEFORE writing to the DB (see server changes), so no duplicate
			// rows are created on retry.
			void handleTransientFailure()
		} else {
			// Validation failure (400) — not retryable, surface immediately.
			isSubmitting = false
			retryCount = 0
			console.error('result', result)
			toast.error('There was an error with your submission.')
		}
	},
})

async function handleTransientFailure() {
	if (retryCount < MAX_CLIENT_RETRIES) {
		const delay = RETRY_DELAYS_MS[retryCount] ?? RETRY_DELAYS_MS.at(-1)
		retryCount += 1
		await new Promise((resolve) => setTimeout(resolve, delay))
		submit()
	} else {
		isSubmitting = false
		retryCount = 0
		toast.error('Upload failed. Your photo is still attached — tap Submit to try again.')
	}
}
```

3. Update the submit button to show retry status:

```svelte
<Button form={formId} type="submit" bind:disabled={isSubmitting}
	>Submit
	{#if isSubmitting}
		<Spinner className="w-4 h-4 ml-4" />
		{#if retryCount > 0}
			<span class="ml-2 text-xs">Retrying… ({retryCount}/{MAX_CLIENT_RETRIES})</span>
		{/if}
	{/if}
</Button>
```

Verify the exact shape of `onError`'s callback argument and `result.status`
availability for your installed `sveltekit-superforms` version (2.30.2) by
checking `node_modules/sveltekit-superforms/dist/client/superForm.d.ts` —
adjust property access (`result.error` vs `result.result.error`, etc.) to
match if it differs from the sketch above.

This same pattern (retry-count state, `onError`, retrying via `submit()`)
should be applied to `EditWateringEventDialog.svelte` for the `editEvent`
action, and optionally to `EditButtonDialog.svelte`/`AddNewPlant.svelte` for
consistency, since all three now share the same "upload happens before DB
write, so full-submission retry is safe" server-side property from Steps
3-6.

---

## Step 9 — Make `ImageUploader.svelte` resilient to remounts

**File: `src/lib/components/ImageUploader.svelte`**

Currently `previewImage` only gets set inside `handleFileSelect`. If the
component ever gets destroyed/recreated (e.g. by a parent conditional or
Dialog internals), the preview would show blank even though the underlying
`fileProx` store still holds the `File`. Initialize the preview from the
existing proxy value on mount:

```ts
import { onMount } from 'svelte'

onMount(() => {
	const existing = fileProx && $fileProx?.[0]
	if (existing) {
		previewImage = URL.createObjectURL(existing)
		fileName = existing.name
	}
})
```

Also set `fileName = file.name` inside `handleFileSelect` (it currently never
gets assigned after the initial declaration — the template references
`{fileName}` at line 106 but nothing sets it):

```ts
async function handleFileSelect(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0]
	if (!file) return

	previewImage = URL.createObjectURL(file)
	fileName = file.name

	const resizedBlob = await resizeImage(file, 1200, 1200)
	const newFileName = file.name.split('.').slice(0, -1).join('.') + '.jpeg'
	const newImageFile = new File([resizedBlob], newFileName, { type: resizedBlob.type })
	fileName = newImageFile.name

	fileProx.set(newImageFile)
}
```

(Optional but recommended while touching this file: call
`URL.revokeObjectURL` on the previous `previewImage` before overwriting it,
to avoid leaking object URLs across repeated selections — not required for
this task but cheap to fix alongside.)

---

## Step 10 — Tests

**File: `src/lib/utils/retry.test.ts`** (new)

Add unit tests for `withRetry`:
- Succeeds on first try — `fn` called once.
- Fails twice with a retryable error (e.g. `{ code: 'ETIMEDOUT' }`), succeeds
  on 3rd attempt — resolves, `fn` called 3 times.
- Fails all `attempts` with a retryable error — rejects with the last error,
  `fn` called exactly `attempts` times.
- Fails with a non-retryable error (e.g. `{ $metadata: { httpStatusCode: 400 } }`)
  — rejects immediately after the first attempt, `fn` called once.
- Use fake timers (`vi.useFakeTimers()`) to avoid real delays slowing down
  the test suite, advancing timers between assertions.

**File: `tests/imageUpload.test.ts`** (update)

- Update/add a test verifying `uploadImageFile` retries on a transient
  `s3Client.send` rejection and eventually succeeds (mock `s3Client.send` to
  reject twice then resolve).
- Add a test verifying it does NOT retry (single call) when the mocked
  rejection isn't classified as transient.
- Leave the pre-existing broken `replaceImage` test as-is (out of scope per
  plan) unless you want it addressed in a follow-up.

**File: `tests/water-action.test.ts`** (new, or add to existing route tests
if a pattern already exists — check `tests/` for how server actions are
currently tested, e.g. via `@sveltejs/kit` test helpers or direct function
import)

- Verify that when `uploadImageFile` throws, no row is inserted into
  `watering_event` (mock `db.insert` and assert it's never called, or use an
  in-memory/test DB and assert row count is unchanged).
- Verify that on success, exactly one `watering_event` row is inserted with
  the correct `image_url`, and `db.insert`/`db.update` is NOT called twice
  (i.e. confirm the old two-step insert-then-update is gone).

Run the full test suite after each step to catch regressions early:

```bash
npm run test
```

---

## Step 11 — Manual verification checklist

After implementing, manually verify:

1. **Happy path**: submit water event with photo — event + photo saved,
   dialog closes, success toast.
2. **Simulated failure**: temporarily throw inside `uploadImageFile` (or use
   dev tools to block requests to the R2 endpoint), submit with a photo —
   confirm:
   - No `watering_event` row appears in the DB.
   - Dialog stays open, error toast shown, and the previously-selected photo
     preview is still visible in `ImageUploader`.
   - Clicking Submit again (once the simulated failure is removed) succeeds
     without needing to re-pick the photo.
3. **Client-side retry**: with dev tools "offline" toggle, submit, then
   toggle back online mid-retry-window — confirm it succeeds automatically
   without the user clicking Submit again, and the "Retrying…" label appears
   briefly.
4. Repeat steps 1-3 for the `editEvent`, `editPlant`, and `newPlant` flows.

---

## Order of execution recap

1. `src/lib/utils/retry.ts` (new) — retry helper + tests.
2. `src/lib/uploadImage.ts` — use `withRetry`.
3. `src/lib/s3Client.ts` — timeouts + `maxAttempts: 1`.
4. `src/routes/[plantId]/+page.server.ts` — reorder `water`, `editPlant`,
   `editEvent`.
5. `src/routes/new/plant/+page.server.ts` — reorder `newPlant`.
6. `src/lib/components/WaterButtonDialog.svelte` — don't close on failure +
   client-side retry.
7. `src/lib/components/EditWateringEventDialog.svelte` — client-side retry
   (dialog-close behavior already correct).
8. `src/lib/components/ImageUploader.svelte` — remount-safe preview + fix
   unset `fileName`.
9. Tests: `retry.test.ts`, updates to `imageUpload.test.ts`, new action test
   for `water`.
10. Manual verification per checklist above.
</content>

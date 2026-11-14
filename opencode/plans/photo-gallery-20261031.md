# Plant Photo Gallery — Implementation Plan

**Date:** 2026-10-31
**Status:** Ready to implement
**Prototype reference:** `prototypes/photo-gallery-prototypes.html` (Option B — Immersive overlay)

---

## Goal

Let a user open any plant photo and browse all of that plant's photos newest → oldest, with the watering-event notes shown as a caption for each photo. The primary entry point is the Past Watering thumbnails; the large plant photo also opens the same gallery at its matching event.

---

## Confirmed decisions

| Decision | Choice |
|---|---|
| Photo set | Every `watering_event` with a non-empty `image_url`. No separate plant-image entry. |
| Order | Newest → oldest, no wrap. |
| Opening photo | The clicked thumbnail. The main plant photo opens at the event whose `image_url` matches `plant.image_url`, falling back to the newest photo. |
| Caption | Date only (`PP` format) + event `notes`. Hide notes when empty. |
| Long notes | Clamp to 3 lines, with **Show more / Show less**. |
| Layout | Immersive overlay: full-screen on mobile, centered dark panel on desktop. |
| Image fit | `object-contain` on a dark background. |
| Navigation | Side chevrons, Embla swipe/drag, and ←/→ keyboard keys. |
| Close | X button, Escape, and backdrop click. |
| Stack | Native `<dialog>` + existing shadcn Carousel (Embla). No new dependencies. |
| Data | Build the photo list in the server load via a small helper. |
| Tests | Vitest test for the helper + Playwright smoke test for the dialog. |

---

## Existing code context

- `src/routes/[plantId]/+page.svelte` — plant detail page. Currently renders the main photo with `<Lightbox url={data.plant.image_url ?? bluegrad} ... />`.
- `src/routes/[plantId]/+page.server.ts` — load function already fetches all `watering_event` rows for the plant, ordered by `desc(watering_event.timestamp)`, and returns `wateringEvents`.
- `src/lib/components/Lightbox.svelte` — current single-image native `<dialog>`. Takes `{ url, className }`.
- `src/lib/components/PastWateringRow.svelte` — renders each event row and currently uses `<Lightbox url={wateringEvent.image_url} />`.
- `src/lib/components/ui/carousel/` — shadcn-svelte Carousel built on Embla. `embla-carousel-svelte` is already installed.
- `src/lib/components/CfImage.svelte` — unpic image wrapper with Cloudflare fallback.
- `src/db/schema.ts` — `watering_event` has `id`, `notes`, `watered`, `fertilized`, `waitUntil`, `image_url`, `plant_id`, `user_id`, `timestamp`. `SelectWateringEvent` is exported.
- `src/app.css` already contains `body:has(dialog[open]) { overflow: hidden; }`, so no extra body-scroll-lock code is needed.
- There is **no comments table**. `watering_event.notes` is the comment associated with a photo.
- Seed plant `/24` currently has 7 photo events and is already used by Playwright tests.

---

## 1. Data layer

### New file: `src/lib/utils/getPlantPhotos.ts`

```ts
import type { SelectWateringEvent } from '#src/db/schema.js'

export type PlantPhoto = {
	id: number
	url: string
	timestamp: number
	notes: string | null
}

export function getPlantPhotos(events: SelectWateringEvent[]): PlantPhoto[] {
	return events
		.filter((event) => Boolean(event.image_url))
		.toSorted((a, b) => b.timestamp - a.timestamp || b.id - a.id)
		.map((event) => ({
			id: event.id,
			url: event.image_url as string,
			timestamp: event.timestamp,
			notes: event.notes ?? null,
		}))
}
```

Notes:

- Do not mutate the input array. `toSorted` is fine if the Node target supports it; otherwise use `[...events].sort(...)`.
- Filter on truthy `image_url`, not just non-null.
- Tie-break by `id` descending for deterministic order.

### Edit: `src/routes/[plantId]/+page.server.ts`

Add the helper import and include the photo list in the load return:

```ts
import { getPlantPhotos } from '#src/lib/utils/getPlantPhotos.js'

// inside load(), after wateringEventsResolved is available:
const photos = getPlantPhotos(wateringEventsResolved)

return {
	plant: { ... },
	wateringEvents: wateringEventsResolved,
	photos,
	// ...existing forms
}
```

The existing `await wateringEvents` in the return can stay as-is or be replaced with `wateringEventsResolved`; keep the change minimal.

No schema or migration changes.

---

## 2. Rework `src/lib/components/Lightbox.svelte`

Keep this as the single photo component used by both call sites. Do not create a second dialog component.

### Props

```ts
let {
	url,
	photos = [],
	initialIndex = 0,
	className = '',
}: {
	url: string
	photos?: PlantPhoto[]
	initialIndex?: number
	className?: string
} = $props()
```

- `url` remains the trigger image. This preserves the `bluegrad` fallback on the main page.
- `photos` is the gallery. If empty, behave as a single-image lightbox using `url`.
- Clamp `initialIndex` to `0 .. photos.length - 1`.

### Trigger

Replace the clickable `CfImage` with a real button:

```svelte
<button
	type="button"
	class="block w-full cursor-pointer border-0 bg-transparent p-0"
	onclick={openGallery}
	aria-label={triggerLabel}
>
	<CfImage
		src={url}
		height={320}
		width={320}
		alt=""
		class={`event-thumb ${className}`}
	/>
</button>
```

- `triggerLabel`: `View photo from {PP date}` when the current photo has a timestamp, otherwise `View photo`.
- Keep the existing `className` behavior so the main page's `aspect-square min-h-16 w-full max-w-80 rounded-lg object-cover` still applies.

### Dialog open/close

Use the native `<dialog>` already in place:

```ts
import { tick } from 'svelte'

let dialog: HTMLDialogElement
let isOpen = $state(false)

async function openGallery() {
	isOpen = true
	await tick()
	dialog.showModal()
}

function handleClose() {
	isOpen = false
}

function handleDialogClick(event: MouseEvent) {
	if (event.target === dialog) dialog.close()
}
```

```svelte
<dialog
	bind:this={dialog}
	onclose={handleClose}
	onclick={handleDialogClick}
	class="..."
>
	{#if isOpen}
		<!-- gallery panel -->
	{/if}
</dialog>
```

Key details:

- Conditional rendering is important so Embla initializes with the correct size and honors `startIndex`.
- The `<dialog>` itself should be a transparent full-viewport layer. The inner panel is the dark rounded surface. This makes backdrop-click detection simple: `event.target === dialog` only when clicking outside the panel.
- Do not add JS body-scroll-lock code; `src/app.css` already handles `dialog[open]`.
- Keep `dialog::backdrop` styling (dim + blur).

### Gallery panel

- Mobile: fills the viewport (`100svh`), no rounded corners.
- Desktop: centered, roughly `min(1000px, 92vw)` wide and `min(90vh, 900px)` tall, rounded corners.
- Background: dark (`bg-neutral-950` or a similar token-independent dark surface).
- Position the top bar, carousel, and caption inside a `relative` panel.

### Carousel

Import the existing components:

```ts
import * as Carousel from '#src/lib/components/ui/carousel/index.js'
```

Use:

```svelte
<Carousel.Root
	opts={{ startIndex: clampedInitialIndex, loop: false, align: 'start' }}
	setApi={(api) => (carouselApi = api)}
	class="h-full"
>
	<Carousel.Content class="-ml-0 h-full">
		{#each photos as photo, index (photo.id)}
			<Carousel.Item class="pl-0">
				<!-- image -->
			</Carousel.Item>
		{/each}
	</Carousel.Content>

	<Carousel.Previous class="..." />
	<Carousel.Next class="..." />
</Carousel.Root>
```

Details:

- Override the carousel's default `-ml-4` / `pl-4` offsets for full-bleed slides.
- Capture the API with `setApi`. Listen to `select` and `reInit` to update:
  - `currentIndex`
  - counter text (`n of N`)
  - disabled states for the arrows
  - caption content
  - reset `expanded = false`
- `Carousel.Previous` / `Carousel.Next` already disable themselves using `canScrollPrev` / `canScrollNext`.
- Restyle them as translucent circular buttons over the image. Their default sr-only text is "Previous slide"/"Next slide"; add `aria-label="Newer photo"` / `aria-label="Older photo"` (or accept the defaults if simpler).
- Hide arrows and counter when `photos.length <= 1`.

### Slide image

- Use `CfImage` for optimized delivery, capped around `width={1600}`.
- Class: `h-full w-full object-contain`.
- Add `draggable="false"` so native image drag does not fight Embla.
- Use `loading="eager"` for the initial photo and `loading="lazy"` for the rest.
- Slide container should fill the panel height; the image letterboxes against the dark background.

### Caption overlay

Position absolute at the bottom, over a gradient:

```svelte
<div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 ...">
	<div class="pointer-events-auto ...">
		<time>{format(new Date(currentPhoto.timestamp), 'PP')}</time>
		{#if currentPhoto.notes}
			<p bind:this={notesEl} class:line-clamp-3={!expanded} class:expanded>
				{currentPhoto.notes}
			</p>
			{#if canExpand}
				<button type="button" onclick={() => (expanded = !expanded)}>
					{expanded ? 'Show less' : 'Show more'}
				</button>
			{/if}
		{/if}
	</div>
</div>
```

- Import `format` from `date-fns`.
- Date format is `PP` (date only), per the decision.
- If `notes` is empty/null, render only the date.
- Clamp CSS:
  - Collapsed: `display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;`
  - Expanded: remove the clamp, cap the height (e.g. `max-h-[40svh]`) and allow `overflow-y: auto`.
- Detect overflow with an effect:
  ```ts
  let notesEl: HTMLElement | undefined = $state()
  let canExpand = $state(false)

  $effect(() => {
  	if (!notesEl || expanded) return
  	canExpand = notesEl.scrollHeight > notesEl.clientHeight + 1
  })
  ```
  Reset `expanded = false` when `currentIndex` changes. Keep `canExpand` true while expanded so the "Show less" button stays visible.
- Add `onpointerdown={(event) => event.stopPropagation()}` to the Show more/less button so pressing it does not start a carousel drag.
- The caption block is outside the carousel; swiping works on the photo area, not the caption.

### Keyboard

Add a keydown handler to the dialog/panel:

```ts
function handleKeydown(event: KeyboardEvent) {
	if (event.defaultPrevented) return
	if (event.key === 'ArrowLeft') {
		event.preventDefault()
		carouselApi?.scrollPrev()
	} else if (event.key === 'ArrowRight') {
		event.preventDefault()
		carouselApi?.scrollNext()
	}
}
```

- ArrowLeft = newer (previous slide).
- ArrowRight = older (next slide).
- Escape is handled natively by `<dialog>`.
- The `event.defaultPrevented` guard prevents double-firing when focus is on a carousel button, because those buttons already call `preventDefault` in their own keydown handler.

### Accessibility

- Trigger is a real button with an aria-label.
- Dialog has an `aria-label` such as `Plant photos`.
- Slide alt text: `Plant photo from {PP date}` plus the note when present.
- Native dialog handles focus trapping, Escape, and returning focus to the trigger.
- Counter should be readable but not announced on every swipe unless desired; keep it simple.

---

## 3. Call sites

### `src/routes/[plantId]/+page.svelte`

Add a derived index:

```ts
const initialPhotoIndex = Math.max(
	0,
	data.photos.findIndex((photo) => photo.url === data.plant.image_url),
)
```

Pass it to the existing Lightbox:

```svelte
<Lightbox
	url={data.plant.image_url ? data.plant.image_url : bluegrad}
	photos={data.photos}
	initialIndex={initialPhotoIndex}
	className="mx-auto aspect-square min-h-16 w-full max-w-80 rounded-lg object-cover"
/>
```

If `plant.image_url` is missing but event photos exist, this opens at the newest photo (index 0) while the trigger still shows `bluegrad`.

### `src/lib/components/PastWateringRow.svelte`

Add:

```ts
const initialPhotoIndex = Math.max(
	0,
	data.photos.findIndex((photo) => photo.id === wateringEvent.id),
)
```

Pass it:

```svelte
<Lightbox
	url={wateringEvent.image_url}
	photos={data.photos}
	initialIndex={initialPhotoIndex}
/>
```

This makes the Past Watering thumbnails the primary gallery entry point, as requested.

---

## 4. Edge cases

- **No event photos:** `photos` is empty. The main photo opens a single-image dialog with no counter, arrows, or caption. This preserves current behavior.
- **One event photo:** show the image and caption, but hide arrows/counter.
- **Main image URL not found in events:** start at the newest photo (index 0).
- **Event with no notes:** show the date only, no placeholder.
- **Long notes:** clamp to 3 lines, Show more/less, expanded content capped and scrollable.
- **Many photos:** optimized Cloudflare images via `CfImage`; lazy-load non-initial slides.
- **Deleted/edited event while the dialog is open:** out of scope; the dialog closes on navigation/refresh.
- **Multiple Lightbox instances:** each row has its own dialog; only one can be open at a time.

---

## 5. Tests

### Vitest

**New file:** `src/lib/utils/getPlantPhotos.test.ts`

The Vitest config includes only `src/**/*.{test,spec}.{js,ts}`, so co-locate the test under `src/`.

Cover:

1. Filters out events with no `image_url` (null, undefined, empty string).
2. Sorts newest first by `timestamp`.
3. Tie-breaks equal timestamps by `id` descending.
4. Maps `id`, `url`, `timestamp`, and `notes` correctly (including `notes: null`).
5. Returns `[]` for an empty input.

Use small plain objects cast to `SelectWateringEvent` rather than hitting the database.

### Playwright

**New file:** `tests/photoGallery.test.ts`

Use the seeded plant `/24`, which has 7 photo events.

Suggested flow:

1. `page.goto('/24')`.
2. Locate the first photo trigger in the Past Watering table (give the trigger button a stable `aria-label`, e.g. `View photo from ...`).
3. Click it; expect the dialog to be visible.
4. Expect the counter to match `/\d+ of \d+/`.
5. Capture the counter/caption, click **Older photo**, expect them to change.
6. Click **Newer photo**, expect them to return.
7. Assert the arrows disable at the newest and oldest ends.
8. Close with Escape; reopen and close by clicking the backdrop.
9. Optionally assert that a note is visible for a seeded event that has one.

Add `data-testid` attributes if role/text selectors are fragile:

- `data-testid="photo-gallery"`
- `data-testid="photo-gallery-counter"`

### Commands

```bash
npm run test:unit
npm run test:integration
npm run check
```

---

## 6. Files touched

**New**

- `src/lib/utils/getPlantPhotos.ts`
- `src/lib/utils/getPlantPhotos.test.ts`
- `tests/photoGallery.test.ts`

**Edited**

- `src/lib/components/Lightbox.svelte`
- `src/routes/[plantId]/+page.svelte`
- `src/routes/[plantId]/+page.server.ts`
- `src/lib/components/PastWateringRow.svelte`

---

## 7. Acceptance criteria

- [ ] Clicking a Past Watering thumbnail opens a dialog showing that photo.
- [ ] Clicking the large plant photo opens the same dialog at its matching event (or newest if no match).
- [ ] The gallery contains every event with an `image_url`, newest first.
- [ ] Chevrons, swipe, and ←/→ all navigate; ends are disabled and do not wrap.
- [ ] The counter reads `n of N`.
- [ ] Each photo shows its date (`PP`) and notes when present; notes are hidden when empty.
- [ ] Long notes clamp to 3 lines and can be expanded/collapsed.
- [ ] X, Escape, and backdrop click close the dialog.
- [ ] The image is fully visible (`object-contain`) on a dark background.
- [ ] Mobile is full-screen; desktop is a centered panel around 1000px / 90vh.
- [ ] No database migration and no new dependencies.
- [ ] Unit and Playwright tests pass; `npm run check` passes.

---

## 8. Out of scope

- No new comments table or comment UI. `watering_event.notes` is the comment.
- No editing or deleting events/photos from inside the gallery.
- No changes to upload flows.
- No database schema or migration changes.
- No new dependencies.

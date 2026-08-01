import { json, error } from '@sveltejs/kit'
import db from 'src/db'
import { push_subscription } from 'src/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated')
	}

	const body = await request.json()
	const { endpoint, keys, userAgent } = body ?? {}

	if (!endpoint || !keys?.p256dh || !keys?.auth) {
		throw error(400, 'Invalid subscription payload')
	}

	const existing = await db
		.select()
		.from(push_subscription)
		.where(eq(push_subscription.endpoint, endpoint))
		.limit(1)

	if (existing[0]) {
		await db
			.update(push_subscription)
			.set({
				user_id: locals.user.id,
				p256dh: keys.p256dh,
				auth: keys.auth,
				user_agent: userAgent ?? null,
			})
			.where(eq(push_subscription.endpoint, endpoint))
	} else {
		await db.insert(push_subscription).values({
			user_id: locals.user.id,
			endpoint,
			p256dh: keys.p256dh,
			auth: keys.auth,
			user_agent: userAgent ?? null,
		})
	}

	return json({ success: true })
}

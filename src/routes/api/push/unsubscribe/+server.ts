import { json, error } from '@sveltejs/kit'
import db from '#src/db/index.js'
import { push_subscription } from '#src/db/schema.js'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated')
	}

	const body = await request.json()
	const { endpoint } = body ?? {}

	if (!endpoint) {
		throw error(400, 'Missing endpoint')
	}

	await db.delete(push_subscription).where(eq(push_subscription.endpoint, endpoint))

	return json({ success: true })
}

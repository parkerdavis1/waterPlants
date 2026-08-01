import { json, error } from '@sveltejs/kit'
import { sendPushToUser } from '$lib/server/push'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated')
	}

	await sendPushToUser(locals.user.id, {
		title: 'Test Notification',
		body: 'If you can see this, push notifications are working! 🌱',
		url: '/settings',
	})

	return json({ success: true })
}

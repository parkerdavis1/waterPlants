import { json, error } from '@sveltejs/kit'
import { checkAndSendWateringNotifications } from '$lib/server/scheduler'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated')
	}

	const sentCount = await checkAndSendWateringNotifications()

	return json({ success: true, sentCount })
}

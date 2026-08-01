import webpush from 'web-push'
import { eq } from 'drizzle-orm'
import db from 'src/db'
import { push_subscription, type SelectPushSubscription } from 'src/db/schema'
import env from '$lib/env'

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY)

export type PushPayload = {
	title: string
	body: string
	url?: string
}

/**
 * Sends a push notification to a single subscription, pruning it from the
 * database if the push service reports it's no longer valid (410/404).
 */
async function sendToSubscription(subscription: SelectPushSubscription, payload: PushPayload) {
	try {
		const result = await webpush.sendNotification(
			{
				endpoint: subscription.endpoint,
				keys: {
					p256dh: subscription.p256dh,
					auth: subscription.auth,
				},
			},
			JSON.stringify(payload),
		)
		console.log(
			`\nPush sent OK to subscription ${subscription.id} (endpoint ...${subscription.endpoint.slice(-12)}): statusCode=${result.statusCode}`,
		)
	} catch (error) {
		const statusCode = (error as { statusCode?: number })?.statusCode
		const body = (error as { body?: string })?.body
		console.error(
			`\nPush send error for subscription ${subscription.id} (endpoint ...${subscription.endpoint.slice(-12)}): statusCode=${statusCode} body=${body}`,
			error,
		)
		if (statusCode === 404 || statusCode === 410) {
			await db.delete(push_subscription).where(eq(push_subscription.id, subscription.id))
		}
	}
}

export async function sendPushToUser(userId: number, payload: PushPayload) {
	const subscriptions = await db
		.select()
		.from(push_subscription)
		.where(eq(push_subscription.user_id, userId))

	await Promise.all(subscriptions.map((subscription) => sendToSubscription(subscription, payload)))
}

/**
 * Sends a push notification to every user that has at least one push
 * subscription. Since the app currently only supports a single house, this
 * is effectively "notify everyone."
 */
export async function sendPushToAllUsers(payload: PushPayload) {
	const subscriptions = await db.select().from(push_subscription)

	await Promise.all(subscriptions.map((subscription) => sendToSubscription(subscription, payload)))
}

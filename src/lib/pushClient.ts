import { PUBLIC_VAPID_KEY } from '$env/static/public'
import { dev } from '$app/environment'

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}

export function pushSupported() {
	return (
		typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
	)
}

/**
 * Registers the service worker. In dev mode, SvelteKit serves it as an ES
 * module (for HMR), which requires registering with `type: 'module'`. In
 * production it's a bundled classic script. See:
 * https://svelte.dev/docs/kit/service-workers
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!pushSupported()) return null
	return navigator.serviceWorker.register('/service-worker.js', {
		type: dev ? 'module' : 'classic',
	})
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
	if (!pushSupported()) return null
	const registration = await registerServiceWorker()
	if (!registration) return null
	return registration.pushManager.getSubscription()
}

export async function subscribeToPush(): Promise<PushSubscription> {
	if (!pushSupported()) {
		throw new Error('Push notifications are not supported in this browser.')
	}

	const permission = await Notification.requestPermission()
	if (permission !== 'granted') {
		throw new Error('Notification permission was not granted.')
	}

	const registration = await registerServiceWorker()
	if (!registration) {
		throw new Error('Failed to register service worker.')
	}

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
	})

	const json = subscription.toJSON()
	const res = await fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			endpoint: json.endpoint,
			keys: json.keys,
			userAgent: navigator.userAgent,
		}),
	})

	if (!res.ok) {
		throw new Error('Failed to save push subscription on the server.')
	}

	return subscription
}

export async function unsubscribeFromPush() {
	const subscription = await getExistingSubscription()
	if (!subscription) return

	const endpoint = subscription.endpoint
	await subscription.unsubscribe()

	await fetch('/api/push/unsubscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ endpoint }),
	})
}

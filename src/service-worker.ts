/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Minimal service worker: enables Web Push notifications for the PWA.
// (No asset caching is done here — this is intentionally kept simple.)

declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', () => {
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
	if (!event.data) return

	let payload: { title?: string; body?: string; url?: string } = {}
	try {
		payload = event.data.json()
	} catch {
		payload = { title: 'Happy Plants', body: event.data.text() }
	}

	const title = payload.title ?? 'Happy Plants'
	const options: NotificationOptions = {
		body: payload.body ?? '',
		icon: '/android-chrome-192x192.png',
		badge: '/favicon-32x32.png',
		data: { url: payload.url ?? '/' },
	}

	event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	const url = (event.notification.data && event.notification.data.url) || '/'

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if ('focus' in client) {
					client.navigate?.(url)
					return client.focus()
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow(url)
			}
		}),
	)
})

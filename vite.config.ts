import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl(),
		VitePWA({
			injectRegister: 'auto',
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
			},
			workbox: {
				navigateFallback: '/',
				runtimeCaching: [
					// 1. App shell (JS, CSS, HTML)
					{
						urlPattern: ({ request }) =>
							request.destination === 'document' ||
							request.destination === 'script' ||
							request.destination === 'style',
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'app-shell',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
							},
						},
					},

					// 2. Images (plant photos, thumbnails)
					{
						urlPattern: ({ request }) => request.destination === 'image',
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
						},
					},

					// 3. API calls (watering logs, plant data)
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/api'),
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							networkTimeoutSeconds: 5,
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24, // 1 day
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
			strategies: 'generateSW',
		}),
	],
	server: {
		https: true,
		host: true,
	},
	// server: {
	// 	https: {
	// 		key: fs.readFileSync(`${process.cwd()}/cert/key.pem`),
	// 		cert: fs.readFileSync(`${process.cwd()}/cert/cert.pem`)
	// 	}
	// },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
})

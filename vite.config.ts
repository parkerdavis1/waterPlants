import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl(),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
			},
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

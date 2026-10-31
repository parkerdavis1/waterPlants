import adapter from '@sveltejs/adapter-node'

// import adapter from '@sveltejs/adapter-auto'
// import adapter from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: vitePreprocess(),
			adapter: adapter(),
		}),
		basicSsl(),
	],
	server: {
		host: false,
		proxy: {
			'/cdn-cgi/image': {
				target: 'https://happyplants.parker.town',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
})

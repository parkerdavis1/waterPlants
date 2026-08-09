import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
	plugins: [sveltekit(), basicSsl()],
	server: {
		https: true,
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

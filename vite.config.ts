import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
// import fs from 'fs';
import basicSsl from "@vitejs/plugin-basic-ssl"


export default defineConfig({
	plugins: [
		sveltekit(), 
		basicSsl()
	],
	server: {
		https: true,
		host: true
	},
	// server: {
	// 	https: {
	// 		key: fs.readFileSync(`${process.cwd()}/cert/key.pem`),
	// 		cert: fs.readFileSync(`${process.cwd()}/cert/cert.pem`)
	// 	}
	// },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

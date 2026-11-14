import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
	},
	use: {
		baseURL: 'https://localhost:4173',
		ignoreHTTPSErrors: true,
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	// This is a Vitest test that lives outside the src/ unit-test include.
	testIgnore: '**/imageUpload.test.ts',
}

export default config

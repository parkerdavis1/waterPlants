import { defineConfig } from 'drizzle-kit'
import env from './src/lib/env'

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './src/db/migrations',
	dialect: 'sqlite',
	dbCredentials: {
		url: env.LOCAL_DEV ? 'file:src/db/happyplants.db' : 'file:/data/happyplants.db',
	},
})

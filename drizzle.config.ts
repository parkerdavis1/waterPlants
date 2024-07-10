import { defineConfig } from 'drizzle-kit';
import env from './src/lib/env';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './src/db/migrations',
	driver: 'turso',
	dialect: 'sqlite',
	dbCredentials: {
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN
	}
});

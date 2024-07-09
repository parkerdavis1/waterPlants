import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import env from '$lib/env';

let client;
if (env.LOCAL_DEV) {
	client = createClient({
		url: 'file:src/db/local.db'
	});
} else {
	client = createClient({
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN
	});
}

const db = drizzle(client, {
	logger: true
});

export type db = typeof db;
export default db;

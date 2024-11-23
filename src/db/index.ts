import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import env from '$lib/env'
import * as schema from 'src/db/schema'

let client
if (env.LOCAL_DEV) {
	client = createClient({
		url: 'file:src/db/local.db',
	})
} else {
	client = createClient({
		url: 'file:/app/data/local.db',
		syncUrl: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN,
		syncInterval: 60,
	})
}

const db = drizzle(client, {
	logger: true,
	schema,
})

export type db = typeof db
export default db
export type Client = typeof client
export { client }

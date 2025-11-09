import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import env from '$lib/env'
import * as schema from 'src/db/schema'

let client
if (env.LOCAL_DEV) {
	client = createClient({
		// url: "file:src/db/local.db",
		url: 'file:src/db/happyplants_backup_20251108.db',
	})
} else {
	client = createClient({
		url: 'file:/data/happyplants.db',
	})
}

// else if (env.LOCAL_SEED) {
// 	client = createClient({
// 		url: env.TURSO_DATABASE_URL,
// 		authToken: env.TURSO_AUTH_TOKEN,
// 	})
// } else {
// 	client = createClient({
// 		url: env.TURSO_DATABASE_URL,
// 		authToken: env.TURSO_AUTH_TOKEN,
// 	})

// 	// Embedded  replicas are causing issues. Never felt fast anyways, so simplifying by just using Turso

// 	// client = createClient({
// 	// 	url: 'file:/app/data/local.db',
// 	// 	syncUrl: env.TURSO_DATABASE_URL,
// 	// 	authToken: env.TURSO_AUTH_TOKEN,
// 	// 	syncInterval: 60,
// 	// })

// 	// console.log('Syncing database...')
// 	// await client.sync()
// 	// console.log('Database synced.')
// }

const db = drizzle(client, {
	logger: true,
	schema,
})

export type db = typeof db
export default db
export type Client = typeof client
export { client }

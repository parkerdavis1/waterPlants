/**
 * Standalone migration runner. Deliberately avoids the `$lib` / `src/*`
 * path aliases (which rely on the .svelte-kit generated tsconfig, not
 * present in the slim production Docker image) so this can run anywhere the
 * repo's `src/db` folder + node_modules are present — including in
 * production via `docker compose run --rm waterplants pnpm db:migrate`.
 */
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import path from 'node:path'
import * as schema from './schema'

config()

const isLocalDev = (process.env.LOCAL_DEV ?? 'false').toLowerCase() === 'true'

const client = createClient({
	url: isLocalDev ? 'file:src/db/happyplants.db' : 'file:/data/happyplants.db',
})

const db = drizzle(client, { schema })

const migrationsFolder = path.join(import.meta.dirname, 'migrations')

console.log(`Running migrations from ${migrationsFolder} against ${isLocalDev ? 'local dev' : 'production'} db...`)

await migrate(db, { migrationsFolder })

console.log('Migrations complete.')

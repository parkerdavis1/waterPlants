/**
 * Resets the passwords for the seeded users to SEED_USER_PASSWORD.
 *
 * Standalone like migrate.ts: deliberately avoids the `#lib` / `src/*` path
 * aliases (which rely on the .svelte-kit generated tsconfig, not present in the
 * slim production Docker image) so it can run anywhere the repo's `src/db`
 * folder + node_modules are present — including in production via
 * `docker compose run --rm waterplants pnpm db:resetPasswords`.
 *
 * Unlike db:seed this never deletes data, so it is safe to run against a live
 * database and safe to run more than once.
 */
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { inArray } from 'drizzle-orm'
import { hash } from '@node-rs/argon2'
import * as schema from './schema'
import { argon2Options, seedPassword } from './seedPassword'

config()

const isLocalDev = (process.env.LOCAL_DEV ?? 'false').toLowerCase() === 'true'

const client = createClient({
	url: isLocalDev ? 'file:src/db/happyplants.db' : 'file:/data/happyplants.db',
})
const db = drizzle(client, { schema })

const names = ['Parker', 'Nell']

const passwordHash = await hash(seedPassword(), argon2Options)

const updated = await db
	.update(schema.user)
	.set({ passwordHash })
	.where(inArray(schema.user.name, names))
	.returning({ name: schema.user.name })

const missing = names.filter((name) => !updated.some((user) => user.name === name))
if (missing.length > 0) {
	throw new Error(`No user found for: ${missing.join(', ')}`)
}

console.log(`Reset password for ${updated.map((user) => user.name).join(', ')}.`)
console.log(`Database: ${isLocalDev ? 'local dev' : 'production'}`)

client.close()

/**
 * One-time fixup script: reconciles the __drizzle_migrations tracking table
 * against the actual migration files on disk, without re-running any SQL.
 *
 * Use this if `pnpm db:migrate` fails with errors like "table X already
 * exists" — that means the database already has the schema from these
 * migrations applied (e.g. it was bootstrapped some other way), but the
 * migrations table doesn't know about it.
 *
 * This computes the same sha256 hash + timestamp drizzle-orm's migrator uses
 * for each file in src/db/migrations, and inserts rows in
 * __drizzle_migrations for all migrations *up to and including* the one you
 * specify with --upTo.
 *
 * By default (no --upTo), it marks everything EXCEPT the most recent
 * migration as applied — the assumption being the most recent migration is
 * the one you actually want `pnpm db:migrate` to run for real afterwards.
 * Pass --upTo <tag> to control this explicitly (e.g. if you want to mark
 * everything including the latest as already applied).
 *
 * Usage:
 *   tsx src/db/reconcileMigrations.ts
 *   tsx src/db/reconcileMigrations.ts --upTo 0003_shiny_zemo
 *
 * IMPORTANT: back up the database file before running this against
 * production.
 */
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { config } from 'dotenv'
import { createClient } from '@libsql/client'

config()

const isLocalDev = (process.env.LOCAL_DEV ?? 'false').toLowerCase() === 'true'

const dbClient = createClient({
	url: isLocalDev ? 'file:src/db/happyplants.db' : 'file:/data/happyplants.db',
})

const migrationsFolder = path.join(import.meta.dirname, 'migrations')
const journal = JSON.parse(
	fs.readFileSync(path.join(migrationsFolder, 'meta/_journal.json')).toString(),
)

const upToArgIndex = process.argv.indexOf('--upTo')
const upToTag: string | undefined =
	upToArgIndex !== -1 ? process.argv[upToArgIndex + 1] : journal.entries.at(-2)?.tag

if (!upToTag) {
	throw new Error(
		'Could not determine a default --upTo tag (need at least 2 migrations). Pass --upTo explicitly.',
	)
}

async function main() {
	await dbClient.execute(`
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		)
	`)

	await dbClient.execute(`DELETE FROM __drizzle_migrations`)

	for (const entry of journal.entries) {
		const filePath = path.join(migrationsFolder, `${entry.tag}.sql`)
		const contents = fs.readFileSync(filePath).toString()
		const hash = crypto.createHash('sha256').update(contents).digest('hex')

		await dbClient.execute({
			sql: `INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)`,
			args: [hash, entry.when],
		})

		console.log(`Marked ${entry.tag} as already applied (hash ${hash})`)

		if (entry.tag === upToTag) {
			break
		}
	}

	console.log('\nDone. Run `pnpm db:migrate` next to apply anything newer.')
}

main()


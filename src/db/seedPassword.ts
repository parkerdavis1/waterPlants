/**
 * Shared password handling for the seed and password-reset scripts.
 *
 * Deliberately avoids the `#lib` / `src/*` path aliases (see migrate.ts) so it
 * also works in the slim production Docker image, where only `src/db` and the
 * production dependencies are present.
 */
import { config } from 'dotenv'
import type { Options } from '@node-rs/argon2'

config()

/** Recommended minimum parameters, shared by seeding and password resets. */
export const argon2Options = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
} satisfies Options

/** Reads the seed password, failing loudly rather than writing an empty credential. */
export function seedPassword(): string {
	const password = process.env.SEED_USER_PASSWORD ?? ''
	if (!password.trim()) {
		throw new Error(
			'SEED_USER_PASSWORD is not set. Add it to .env before seeding or resetting passwords.',
		)
	}
	return password
}

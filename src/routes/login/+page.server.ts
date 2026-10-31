import { verify } from '@node-rs/argon2'
import { fail, redirect, type RequestEvent } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import * as auth from '#lib/server/auth.js'
import {
	isRateLimited,
	recordFailure,
	resetRateLimit,
	retryAfterSeconds,
} from '#lib/server/rateLimit.js'
import db from '#src/db/index.js'
import * as table from '#src/db/schema.js'
import { lower } from '#src/db/schema.js'
import type { Actions, PageServerLoad } from './$types'

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const USERNAME_MAX_ATTEMPTS = 5
const IP_MAX_ATTEMPTS = 20
const INVALID_CREDENTIALS = 'Incorrect username or password'

type Limit = { key: string; max: number }

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		return redirect(302, '/')
	}
	return {}
}

export const actions: Actions = {
	login: async (event) => {
		const credentials = parseLoginForm(await event.request.formData())
		if (!credentials) {
			return fail(400, { message: INVALID_CREDENTIALS })
		}

		const { username, password } = credentials
		const limits = loginLimits(event, username)

		// Check before touching the database or running argon2.
		if (limits.some(isBlocked)) {
			return throttleResponse(limits)
		}

		const user = await findUserByName(username)
		if (!user || !(await verify(user.passwordHash, password))) {
			for (const limit of limits) recordFailure(limit.key, LOGIN_WINDOW_MS)
			return fail(400, { message: INVALID_CREDENTIALS })
		}

		// Successful login clears the counters for this user and IP.
		for (const limit of limits) resetRateLimit(limit.key)
		await auth.startSession(event, user.id)
		redirect(302, '/')
	},
}

/** Returns the normalized username and password, or null if the form is invalid or a honeypot was filled. */
function parseLoginForm(formData: FormData) {
	const username = String(formData.get('username') ?? '').trim()
	const password = formData.get('password')

	// Honeypot: humans never fill this in, bots fill every field.
	if (formData.get('secret_key')) return null
	if (!username || typeof password !== 'string') return null

	return { username: username.toLowerCase(), password }
}

/**
 * Throttle keys for one attempt. The per-IP key uses `getClientAddress()`, which
 * respects adapter-node's ADDRESS_HEADER setting; behind the Cloudflare tunnel that
 * should be `CF-Connecting-IP` (with XFF_DEPTH=1), otherwise every request looks
 * like localhost and the per-IP bucket is shared by everyone (the per-username
 * limit still applies).
 */
function loginLimits(event: RequestEvent, username: string): Limit[] {
	const limits: Limit[] = [{ key: `login:user:${username}`, max: USERNAME_MAX_ATTEMPTS }]
	try {
		limits.push({ key: `login:ip:${event.getClientAddress()}`, max: IP_MAX_ATTEMPTS })
	} catch {
		// No client address available; only the per-username limit applies.
	}
	return limits
}

function isBlocked(limit: Limit) {
	return isRateLimited(limit.key, limit.max)
}

function throttleResponse(limits: Limit[]) {
	const wait = Math.max(0, ...limits.filter(isBlocked).map((l) => retryAfterSeconds(l.key)))
	const minutes = Math.max(1, Math.ceil(wait / 60))

	return fail(429, {
		message: `Too many login attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
	})
}

async function findUserByName(username: string) {
	const [user] = await db
		.select()
		.from(table.user)
		.where(eq(lower(table.user.name), username))
		.limit(1)
	return user
}

/*
//
// In case registering should be reincorporated into the API.
// Otherwise, no registering!!!
//
	register: async (event) => {
		const formData = await event.request.formData()
		const username = String(formData.get('username') ?? '').trim()
		const password = formData.get('password')

		if (!username || typeof password !== 'string') {
			return fail(400, { message: 'Username and password are required' })
		}

		// const userId = generateUserId()
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})

		try {
			const [{ userId }] = await db
				.insert(table.user)
				.values({ name: username, passwordHash })
				.returning({ userId: table.user.id })

			const sessionToken = auth.generateSessionToken()
			const session = await auth.createSession(sessionToken, userId)
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
		} catch (e) {
			return fail(500, { message: 'An error has occurred' })
		}
		return redirect(302, '/')
	},
*/

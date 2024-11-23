import { hash, verify } from '@node-rs/argon2'
import { encodeBase32LowerCase } from '@oslojs/encoding'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import * as auth from '$lib/server/auth'
import db from 'src/db'
import * as table from 'src/db/schema'
import { lower } from 'src/db/schema'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		return redirect(302, '/')
	}
	return {}
}

export const actions: Actions = {
	login: async (event) => {
		console.log('LOGGIN IN')
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		const results = await db
			.select()
			.from(table.user)
			.where(eq(lower(table.user.name), String(username).toLowerCase()))

		const existingUser = results.at(0)
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' })
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' })
		}

		const sessionToken = auth.generateSessionToken()
		const session = await auth.createSession(sessionToken, existingUser.id)
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)

		return redirect(302, '/')
	},
	register: async (event) => {
		console.log('registering!')
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

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
}

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15))
	const id = encodeBase32LowerCase(bytes)
	return id
}

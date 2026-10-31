import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RequestEvent } from '@sveltejs/kit'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeHexLowerCase } from '@oslojs/encoding'

const { dbMock, envMock } = vi.hoisted(() => ({
	dbMock: {
		select: vi.fn(),
		insert: vi.fn(),
		delete: vi.fn(),
		update: vi.fn(),
	},
	envMock: { dev: true },
}))

vi.mock('#src/db/index.js', () => ({ default: dbMock }))
vi.mock('$app/env', () => envMock)

import {
	createSession,
	deleteSessionTokenCookie,
	generateSessionToken,
	invalidateSession,
	sessionCookieName,
	setSessionTokenCookie,
	startSession,
	validateSessionToken,
} from './auth.js'

const DAY_IN_MS = 1000 * 60 * 60 * 24

function mockCookieEvent() {
	const set = vi.fn()
	const remove = vi.fn()

	return {
		event: { cookies: { set, delete: remove } } as unknown as RequestEvent,
		set,
		remove,
	}
}

function selectReturns(result: unknown) {
	dbMock.select.mockReturnValue({
		from: () => ({
			innerJoin: () => ({
				where: async () => [result],
			}),
		}),
	})
}

function selectReturnsNothing() {
	dbMock.select.mockReturnValue({
		from: () => ({
			innerJoin: () => ({
				where: async () => [],
			}),
		}),
	})
}

beforeEach(() => {
	vi.clearAllMocks()
})

afterEach(() => {
	vi.useRealTimers()
	envMock.dev = true
})

describe('generateSessionToken', () => {
	it('returns a base64url token with 18 bytes of entropy', () => {
		const token = generateSessionToken()

		expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
		// 18 bytes -> 24 base64url characters, no padding.
		expect(token).toHaveLength(24)
	})

	it('returns a different token every time', () => {
		const tokens = new Set(Array.from({ length: 100 }, () => generateSessionToken()))

		expect(tokens.size).toBe(100)
	})
})

describe('createSession', () => {
	it('stores the SHA-256 hash of the token, never the raw token', async () => {
		const insertValues = vi.fn(async () => undefined)
		dbMock.insert.mockReturnValue({ values: insertValues })

		const token = 'raw-token-value'
		const session = await createSession(token, 1)

		const expectedId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
		expect(session.id).toBe(expectedId)
		expect(session.id).not.toBe(token)
		expect(insertValues).toHaveBeenCalledWith(session)
	})

	it('expires the new session 30 days out', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
		dbMock.insert.mockReturnValue({ values: async () => undefined })

		const session = await createSession('token', 7)

		expect(session.userId).toBe(7)
		expect(session.expiresAt.getTime()).toBe(new Date('2026-01-31T00:00:00Z').getTime())
	})
})

describe('startSession', () => {
	it('creates a session and sets the cookie to the same token', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
		const insertValues = vi.fn(async () => undefined)
		dbMock.insert.mockReturnValue({ values: insertValues })
		const { event, set } = mockCookieEvent()

		await startSession(event, 3)

		const [storedSession] = insertValues.mock.calls[0] as unknown as [{ id: string; userId: number }]
		expect(storedSession.userId).toBe(3)
		expect(set).toHaveBeenCalledTimes(1)
		const [name, token, options] = set.mock.calls[0]
		expect(name).toBe(sessionCookieName)
		expect(encodeHexLowerCase(sha256(new TextEncoder().encode(token)))).toBe(storedSession.id)
		expect(options.expires.getTime()).toBe(new Date('2026-01-31T00:00:00Z').getTime())
	})
})

describe('invalidateSession', () => {
	it('deletes the session row', async () => {
		const deleteWhere = vi.fn(async () => undefined)
		dbMock.delete.mockReturnValue({ where: deleteWhere })

		await invalidateSession('session-id')

		expect(dbMock.delete).toHaveBeenCalledTimes(1)
		expect(deleteWhere).toHaveBeenCalledTimes(1)
	})
})

describe('session cookies', () => {
	it('sets the session cookie with secure flags in development', () => {
		envMock.dev = true
		const { event, set } = mockCookieEvent()
		const expiresAt = new Date('2026-12-31T00:00:00Z')

		setSessionTokenCookie(event, 'token-value', expiresAt)

		expect(set).toHaveBeenCalledWith(sessionCookieName, 'token-value', {
			expires: expiresAt,
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
		})
	})

	it('sets the session cookie as secure in production', () => {
		envMock.dev = false
		const { event, set } = mockCookieEvent()
		const expiresAt = new Date('2026-12-31T00:00:00Z')

		setSessionTokenCookie(event, 'token-value', expiresAt)

		expect(set).toHaveBeenCalledWith(sessionCookieName, 'token-value', {
			expires: expiresAt,
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
		})
	})

	it('deletes the session cookie with flags matching the set call in production', () => {
		envMock.dev = false
		const { event, remove } = mockCookieEvent()

		deleteSessionTokenCookie(event)

		expect(remove).toHaveBeenCalledWith(sessionCookieName, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
		})
	})
})

describe('validateSessionToken', () => {
	it('returns no user when the session does not exist', async () => {
		selectReturnsNothing()

		const result = await validateSessionToken('unknown-token')

		expect(result).toEqual({ session: null, user: null })
	})

	it('deletes an expired session and returns no user', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

		const deleteWhere = vi.fn(async () => undefined)
		dbMock.delete.mockReturnValue({ where: deleteWhere })
		selectReturns({
			session: {
				id: 'session-id',
				userId: 1,
				expiresAt: new Date('2025-12-31T23:59:59Z'),
			},
			user: { id: 1, name: 'Parker', avatar_url: null },
		})

		const result = await validateSessionToken('expired-token')

		expect(result).toEqual({ session: null, user: null })
		expect(dbMock.delete).toHaveBeenCalledTimes(1)
		expect(deleteWhere).toHaveBeenCalledTimes(1)
	})

	it('returns the user on a valid session', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

		const session = {
			id: 'session-id',
			userId: 1,
			expiresAt: new Date('2026-01-20T00:00:00Z'), // 19 days out
		}
		const user = { id: 1, name: 'Parker', avatar_url: null }
		selectReturns({ session, user })

		const result = await validateSessionToken('valid-token')

		expect(result.user).toEqual(user)
		expect(result.session?.expiresAt).toEqual(session.expiresAt)
		// Not inside the 15-day renewal window, so no write.
		expect(dbMock.update).not.toHaveBeenCalled()
	})

	it('renews a session that is close to expiry and writes the new expiry', async () => {
		const now = new Date('2026-01-01T00:00:00Z')
		vi.useFakeTimers()
		vi.setSystemTime(now)

		const updateWhere = vi.fn(async () => undefined)
		const updateSet = vi.fn(() => ({ where: updateWhere }))
		dbMock.update.mockReturnValue({ set: updateSet })
		const session = {
			id: 'session-id',
			userId: 1,
			expiresAt: new Date('2026-01-10T00:00:00Z'), // 9 days out
		}
		selectReturns({
			session,
			user: { id: 1, name: 'Parker', avatar_url: null },
		})

		const result = await validateSessionToken('renew-me')

		const expectedExpiry = new Date(now.getTime() + DAY_IN_MS * 30)
		expect(updateSet).toHaveBeenCalledWith({ expiresAt: expectedExpiry })
		expect(updateWhere).toHaveBeenCalledTimes(1)
		expect(result.session?.expiresAt.getTime()).toBe(expectedExpiry.getTime())
	})

	it('renews a session exactly 15 days from expiry', async () => {
		const now = new Date('2026-01-01T00:00:00Z')
		vi.useFakeTimers()
		vi.setSystemTime(now)

		dbMock.update.mockReturnValue({ set: () => ({ where: async () => undefined }) })
		selectReturns({
			session: {
				id: 'session-id',
				userId: 1,
				expiresAt: new Date(now.getTime() + DAY_IN_MS * 15),
			},
			user: { id: 1, name: 'Parker', avatar_url: null },
		})

		await validateSessionToken('boundary-token')

		expect(dbMock.update).toHaveBeenCalledTimes(1)
	})

	it('does not renew a session just outside the 15-day window', async () => {
		const now = new Date('2026-01-01T00:00:00Z')
		vi.useFakeTimers()
		vi.setSystemTime(now)

		selectReturns({
			session: {
				id: 'session-id',
				userId: 1,
				expiresAt: new Date(now.getTime() + DAY_IN_MS * 15 + 1000),
			},
			user: { id: 1, name: 'Parker', avatar_url: null },
		})

		await validateSessionToken('boundary-token')

		expect(dbMock.update).not.toHaveBeenCalled()
	})
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isRedirect, type RequestEvent } from '@sveltejs/kit'

type ActionResult = {
	status: number
	location?: string
	data?: { message?: string }
}

const { queryState, verifyMock, authMock } = vi.hoisted(() => ({
	queryState: { rows: [] as unknown[] },
	verifyMock: vi.fn(),
	authMock: {
		startSession: vi.fn(),
	},
}))

vi.mock('@node-rs/argon2', () => ({ verify: verifyMock }))

vi.mock('#src/db/index.js', () => ({
	default: {
		select: () => ({
			from: () => ({
				where: () => ({ limit: async () => queryState.rows }),
			}),
		}),
	},
}))

vi.mock('#lib/server/auth.js', () => authMock)

import { actions } from './+page.server'

const login = actions.login as unknown as (event: RequestEvent) => Promise<ActionResult>

const WINDOW_MS = 15 * 60 * 1000
let keyCounter = 0

function unique(prefix: string) {
	keyCounter += 1
	return `${prefix}-${keyCounter}`
}

function userRow(name: string) {
	return { id: 1, name, passwordHash: 'hashed-password', avatar_url: null }
}

async function runLogin(
	username: string,
	password: string,
	ip: string | null,
	extraFields: Record<string, string> = {},
): Promise<ActionResult> {
	const formData = new FormData()
	formData.set('username', username)
	formData.set('password', password)
	for (const [name, value] of Object.entries(extraFields)) formData.set(name, value)

	const event = {
		request: { formData: async () => formData },
		getClientAddress: () => {
			if (ip === null) throw new Error('no client address')
			return ip
		},
	} as unknown as RequestEvent

	try {
		return (await login(event)) as ActionResult
	} catch (error) {
		// SvelteKit's redirect() throws; anything else is a real failure.
		if (isRedirect(error)) return error as unknown as ActionResult
		throw error
	}
}

describe('login throttling', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
		vi.clearAllMocks()

		verifyMock.mockImplementation(async (_hash: string, password: string) => {
			return password === 'correct'
		})
		queryState.rows = []
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('blocks after five failed attempts for the same username', async () => {
		const username = unique('throttle')
		const ip = unique('ip')
		queryState.rows = [userRow(username)]

		for (let attempt = 0; attempt < 5; attempt++) {
			const result = await runLogin(username, 'wrong', ip)
			expect(result.status).toBe(400)
		}

		const blocked = await runLogin(username, 'correct', ip)

		expect(blocked.status).toBe(429)
		expect(blocked.data?.message).toMatch(/Too many login attempts/)
		// The throttled attempt never reaches password verification.
		expect(verifyMock).toHaveBeenCalledTimes(5)
	})

	it('treats usernames case-insensitively for throttling', async () => {
		const username = unique('case')
		const ip = unique('ip')
		queryState.rows = [userRow(username)]

		for (let attempt = 0; attempt < 5; attempt++) {
			await runLogin(username.toUpperCase(), 'wrong', ip)
		}

		const blocked = await runLogin(username.toLowerCase(), 'correct', ip)

		expect(blocked.status).toBe(429)
	})

	it('counts attempts for unknown usernames too', async () => {
		const username = unique('missing')
		const ip = unique('ip')
		queryState.rows = []

		for (let attempt = 0; attempt < 5; attempt++) {
			const result = await runLogin(username, 'wrong', ip)
			expect(result.status).toBe(400)
		}

		const blocked = await runLogin(username, 'correct', ip)

		expect(blocked.status).toBe(429)
		expect(verifyMock).not.toHaveBeenCalled()
	})

	it('allows attempts again after the window expires', async () => {
		const username = unique('expiry')
		const ip = unique('ip')
		queryState.rows = [userRow(username)]

		for (let attempt = 0; attempt < 5; attempt++) {
			await runLogin(username, 'wrong', ip)
		}
		expect((await runLogin(username, 'correct', ip)).status).toBe(429)

		vi.advanceTimersByTime(WINDOW_MS + 1)

		expect((await runLogin(username, 'correct', ip)).status).toBe(302)
	})

	it('clears the counter after a successful login', async () => {
		const username = unique('reset')
		const ip = unique('ip')
		queryState.rows = [userRow(username)]

		for (let attempt = 0; attempt < 4; attempt++) {
			await runLogin(username, 'wrong', ip)
		}

		const success = await runLogin(username, 'correct', ip)
		expect(success.status).toBe(302)

		for (let attempt = 0; attempt < 4; attempt++) {
			const result = await runLogin(username, 'wrong', ip)
			expect(result.status).toBe(400)
		}

		// Five more failures would trip the limit; four do not.
		expect((await runLogin(username, 'correct', ip)).status).toBe(302)
	})

	it('limits a single IP across many usernames', async () => {
		const ip = unique('ip')

		for (let attempt = 0; attempt < 20; attempt++) {
			const username = unique('spray')
			queryState.rows = [userRow(username)]
			const result = await runLogin(username, 'wrong', ip)
			expect(result.status).toBe(400)
		}

		const blocked = await runLogin(unique('spray'), 'correct', ip)

		expect(blocked.status).toBe(429)
		expect(verifyMock).toHaveBeenCalledTimes(20)
	})

	it('starts a session and redirects home on success', async () => {
		const username = unique('success')
		const ip = unique('ip')
		queryState.rows = [userRow(username)]

		const result = await runLogin(username, 'correct', ip)

		expect(result.status).toBe(302)
		expect(result.location).toBe('/')
		expect(authMock.startSession).toHaveBeenCalledWith(expect.anything(), 1)
	})

	it('rejects a filled honeypot without checking the password', async () => {
		const username = unique('honeypot')
		const ip = unique('ip')
		queryState.rows = [userRow(username)]

		const result = await runLogin(username, 'correct', ip, { secret_key: 'bot' })

		expect(result.status).toBe(400)
		expect(verifyMock).not.toHaveBeenCalled()
		expect(authMock.startSession).not.toHaveBeenCalled()
	})

	it('rejects a blank username without checking credentials', async () => {
		const ip = unique('ip')
		queryState.rows = [userRow('anyone')]

		expect((await runLogin('', 'correct', ip)).status).toBe(400)
		expect((await runLogin('   ', 'correct', ip)).status).toBe(400)
		expect(verifyMock).not.toHaveBeenCalled()
	})

	it('still applies the username limit when the client address is unavailable', async () => {
		const username = unique('noip')
		queryState.rows = [userRow(username)]

		for (let attempt = 0; attempt < 5; attempt++) {
			const result = await runLogin(username, 'wrong', null)
			expect(result.status).toBe(400)
		}

		const blocked = await runLogin(username, 'correct', null)

		expect(blocked.status).toBe(429)
		expect(verifyMock).toHaveBeenCalledTimes(5)
	})
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isRateLimited, recordFailure, resetRateLimit, retryAfterSeconds } from './rateLimit.js'

const WINDOW_MS = 15 * 60 * 1000
const LIMIT = 5

// Each test uses its own keys so the module-level store can't leak between them.
let keyCounter = 0
function nextKey() {
	keyCounter += 1
	return `test:${keyCounter}`
}

describe('rateLimit', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('does not limit a key with no recorded failures', () => {
		expect(isRateLimited(nextKey(), LIMIT)).toBe(false)
	})

	it('does not limit below the threshold', () => {
		const key = nextKey()

		for (let i = 0; i < LIMIT - 1; i++) recordFailure(key, WINDOW_MS)

		expect(isRateLimited(key, LIMIT)).toBe(false)
	})

	it('limits once the threshold is reached', () => {
		const key = nextKey()

		for (let i = 0; i < LIMIT; i++) recordFailure(key, WINDOW_MS)

		expect(isRateLimited(key, LIMIT)).toBe(true)
	})

	it('reports the remaining window in seconds', () => {
		const key = nextKey()
		recordFailure(key, WINDOW_MS)

		expect(retryAfterSeconds(key)).toBe(WINDOW_MS / 1000)

		vi.advanceTimersByTime(60_000)
		expect(retryAfterSeconds(key)).toBe((WINDOW_MS - 60_000) / 1000)
	})

	it('returns 0 retry time when not limited', () => {
		expect(retryAfterSeconds(nextKey())).toBe(0)
	})

	it('allows attempts again after the window expires', () => {
		const key = nextKey()

		for (let i = 0; i < LIMIT; i++) recordFailure(key, WINDOW_MS)
		expect(isRateLimited(key, LIMIT)).toBe(true)

		vi.advanceTimersByTime(WINDOW_MS + 1)
		expect(isRateLimited(key, LIMIT)).toBe(false)
	})

	it('starts a fresh count after the window expires', () => {
		const key = nextKey()

		for (let i = 0; i < LIMIT; i++) recordFailure(key, WINDOW_MS)

		vi.advanceTimersByTime(WINDOW_MS + 1)
		recordFailure(key, WINDOW_MS)

		expect(isRateLimited(key, LIMIT)).toBe(false)
		expect(retryAfterSeconds(key)).toBe(WINDOW_MS / 1000)
	})

	it('does not extend the window on later failures', () => {
		const key = nextKey()

		for (let i = 0; i < LIMIT; i++) recordFailure(key, WINDOW_MS)

		vi.advanceTimersByTime(WINDOW_MS - 60_000)
		recordFailure(key, WINDOW_MS) // still inside the original window

		vi.advanceTimersByTime(60_001)
		expect(isRateLimited(key, LIMIT)).toBe(false)
	})

	it('clears a key on reset', () => {
		const key = nextKey()

		for (let i = 0; i < LIMIT; i++) recordFailure(key, WINDOW_MS)
		expect(isRateLimited(key, LIMIT)).toBe(true)

		resetRateLimit(key)

		expect(isRateLimited(key, LIMIT)).toBe(false)
		expect(retryAfterSeconds(key)).toBe(0)
	})
})

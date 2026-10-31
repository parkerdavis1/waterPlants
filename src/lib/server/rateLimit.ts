/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * This is intentionally simple: the app runs as a single long-running
 * container, so an in-process Map is enough. Attempts reset on deploy/restart,
 * which is acceptable for this app. If it ever runs as multiple instances,
 * move this to the database or a shared store.
 */

type Bucket = {
	count: number
	resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Only sweep when the map has grown enough to be worth the iteration. */
const SWEEP_THRESHOLD = 1_000

function sweep(now: number) {
	if (buckets.size < SWEEP_THRESHOLD) return

	for (const [key, bucket] of buckets) {
		if (now >= bucket.resetAt) buckets.delete(key)
	}
}

/** True once `limit` failures have been recorded inside the current window. */
export function isRateLimited(key: string, limit: number): boolean {
	const bucket = buckets.get(key)
	if (!bucket || Date.now() >= bucket.resetAt) return false

	return bucket.count >= limit
}

/** Seconds until the current window for `key` expires (0 if not limited). */
export function retryAfterSeconds(key: string): number {
	const bucket = buckets.get(key)
	if (!bucket) return 0

	return Math.max(0, Math.ceil((bucket.resetAt - Date.now()) / 1000))
}

/**
 * Record one failed attempt. The window starts on the first failure and is
 * not extended by later failures, so a user can always retry after it expires.
 */
export function recordFailure(key: string, windowMs: number): void {
	const now = Date.now()
	sweep(now)

	const bucket = buckets.get(key)
	if (!bucket || now >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs })
		return
	}

	bucket.count += 1
}

/** Clear a key, e.g. after a successful login. */
export function resetRateLimit(key: string): void {
	buckets.delete(key)
}

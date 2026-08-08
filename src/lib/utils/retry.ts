export interface RetryOptions {
	attempts?: number
	baseDelayMs?: number
	isRetryable?: (error: unknown) => boolean
}

const DEFAULT_RETRYABLE_CODES = new Set([
	'ETIMEDOUT',
	'ECONNRESET',
	'ECONNREFUSED',
	'EPIPE',
	'ENOTFOUND',
	'EAI_AGAIN',
])

export function isTransientError(error: unknown): boolean {
	const err = error as { code?: string; name?: string; $metadata?: { httpStatusCode?: number } }
	if (err?.code && DEFAULT_RETRYABLE_CODES.has(err.code)) return true
	if (err?.name === 'TimeoutError' || err?.name === 'AbortError') return true
	const status = err?.$metadata?.httpStatusCode
	if (status && status >= 500) return true
	return false
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const attempts = options.attempts ?? 3
	const baseDelayMs = options.baseDelayMs ?? 500
	const isRetryable = options.isRetryable ?? isTransientError

	let lastError: unknown
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error
			const isLastAttempt = attempt === attempts
			if (isLastAttempt || !isRetryable(error)) throw error
			const jitter = Math.random() * 250
			const delay = baseDelayMs * 2 ** (attempt - 1) + jitter
			console.warn(
				`\nTransient error on attempt ${attempt}/${attempts}, retrying in ${Math.round(delay)}ms:`,
				error,
			)
			await sleep(delay)
		}
	}
	throw lastError
}

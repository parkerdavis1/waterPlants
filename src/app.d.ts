// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { SessionValidationResult } from '$lib/server/auth'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: SessionValidationResult['user']
			session: SessionValidationResult['session']
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

import db from 'src/db'
import type { LayoutServerLoad } from './$types'
import { user } from 'src/db/schema'

export const ssr = false

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.user) {
		return {
			user: locals.user,
			loggedIn: true,
		}
	} else {
		return {
			loggedIn: false,
		}
	}
}

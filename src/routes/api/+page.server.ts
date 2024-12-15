import { fail, redirect } from "@sveltejs/kit"
import * as auth from '$lib/server/auth'


export const actions ={
    logout: async (event) => {
		console.log('logging out...')
		if (!event.locals.session) {
			return fail(401)
		}
		await auth.invalidateSession(event.locals.session.id)
		auth.deleteSessionTokenCookie(event)

		return redirect(302, '/login')
	},
}
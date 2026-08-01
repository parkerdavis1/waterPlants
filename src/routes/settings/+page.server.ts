import env from '$lib/env'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		isDev: env.LOCAL_DEV,
	}
}

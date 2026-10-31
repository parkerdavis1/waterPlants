import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({ PUBLIC_VAPID_KEY: { public: true, static: true } })

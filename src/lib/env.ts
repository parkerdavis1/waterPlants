import { config } from 'dotenv'
import { ZodError, z } from 'zod'

const stringBoolean = z.coerce
	.string()
	.transform((val) => val.toLowerCase() === 'true')
	.default('false')

const EnvSchema = z.object({
	TURSO_DATABASE_URL: z.string(),
	TURSO_AUTH_TOKEN: z.string(),
	LOCAL_DEV: stringBoolean,
	LOCAL_SEED: stringBoolean,
	R2_ACCOUNT_ID: z.string(),
	R2_TOKEN: z.string(),
	R2_ACCESS_KEY_ID: z.string(),
	R2_SECRET_ACCESS_KEY: z.string(),
	R2_ENDPOINT: z.string().url(),
	R2_BUCKET_NAME: z.string(),
	R2_BUCKET_BASE_URL: z.string().url(),
})

export type EnvSchema = z.infer<typeof EnvSchema>

config()

try {
	EnvSchema.parse(process.env)
} catch (error) {
	if (error instanceof ZodError) {
		let message = 'Missing required values in .env:\n'
		error.issues.forEach((issue) => {
			message += issue.path[0] + '\n'
		})
		const e = new Error(message)
		e.stack = ''
		throw e
	} else {
		console.error(error)
	}
}

export default EnvSchema.parse(process.env)

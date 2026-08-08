import { S3Client } from '@aws-sdk/client-s3'
import env from './env'
import { NodeHttpHandler } from '@smithy/node-http-handler'

const s3Client = new S3Client({
	region: 'auto',
	endpoint: env.R2_ENDPOINT,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
	requestHandler: new NodeHttpHandler({
		connectionTimeout: 5000, // fail fast if we can't even connect
		socketTimeout: 15000, // fail fast if the upload stalls mid-transfer
	}),
	maxAttempts: 1, // we handle retries ourselves in uploadImage.ts via withRetry
})

export default s3Client

import env from 'src/lib/env'
import s3Client from 'src/lib/s3Client'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { withRetry } from './utils/retry'

function sanitizeFilename(name: string) {
	return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export async function uploadImageFile(image: File | Blob) {
	// test
	// throw new Error('image fail')

	const arrayBuffer = await image.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)

	const originalName = image.name ?? 'upload'
	const key = `${Date.now()}-${sanitizeFilename(originalName)}`
	const contentType = image.type ?? 'application/octet-stream'

	const command = new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key,
		Body: buffer,
		ContentType: contentType,
	})

	await withRetry(() => s3Client.send(command), { attempts: 3, baseDelayMs: 500 })

	return {
		url: env.R2_BUCKET_BASE_URL + key,
		key: key,
	}
}

export async function deleteImageByKey(key: string) {
	const cmd = new DeleteObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key,
	})
	const res = await s3Client.send(cmd)
	// S3/R2 sometimes returns 204, sometimes 200; check metadata
	const code = res?.$metadata?.httpStatusCode
	return code === 200 || code === 204
}

export async function deleteImageByUrl(url: string) {
	if (!url) return false
	try {
		const parsed = new URL(url)
		const key = parsed.pathname.replace(/^\/+/, '')
		return await deleteImageByKey(key)
	} catch (e) {
		// fallback: last path segment
		const key = url.split('/').pop()
		if (!key) return false
		return await deleteImageByKey(key)
	}
}

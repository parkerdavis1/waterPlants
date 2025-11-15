import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock environment and s3Client before importing the module under test.
vi.mock('src/lib/env', () => {
	return {
		default: {
			R2_BUCKET_NAME: 'test-bucket',
			R2_BUCKET_BASE_URL: 'https://bucket.example/',
		},
	}
})
const sendMock = vi.fn()
vi.mock('src/lib/s3Client', () => {
	return {
		default: {
			send: sendMock,
		},
	}
})
// Now import the module under test (mocks are active)
import * as uploadModule from 'src/lib/uploadImage'
beforeEach(() => {
	sendMock.mockReset()
})

describe('uploadImage helpers', () => {
	it('uploadImageFile calls s3Client.send with PutObject and returns url/key', async () => {
		// Create a Blob that mimics File (has arrayBuffer), add a name property
		const data = new Uint8Array([1, 2, 3])
		const blob = new Blob([data], { type: 'image/png' })
		blob.name = 'my photo.png' // simulate File.name
		// s3Client.send should resolve successfully
		sendMock.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } })
		const result = await uploadModule.uploadImageFile(blob)
		expect(result).toHaveProperty('url')
		expect(result).toHaveProperty('key')
		expect(result.url).toBe('https://bucket.example/' + result.key)
		expect(sendMock).toHaveBeenCalledTimes(1)
		const cmd = sendMock.mock.calls[0][0]
		// Command input should include sanitized filename and proper content-type
		expect(cmd.input.Key).toEqual(expect.stringContaining('my-photo.png'))
		expect(cmd.input.ContentType).toBe('image/png')
	})

	it('deleteImageByKey returns true when S3 returns 200/204 and passes key', async () => {
		sendMock.mockResolvedValueOnce({ $metadata: { httpStatusCode: 204 } })
		const ok = await uploadModule.deleteImageByKey('some/path/key.png')
		expect(ok).toBe(true)
		expect(sendMock).toHaveBeenCalledTimes(1)
		const cmd = sendMock.mock.calls[0][0]
		expect(cmd.input.Key).toBe('some/path/key.png')
	})

	it('deleteImageByUrl parses URL path and deletes correct key', async () => {
		sendMock.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } })
		const url = 'https://bucket.example/some/path/image.png'
		const ok = await uploadModule.deleteImageByUrl(url)
		expect(ok).toBe(true)
		expect(sendMock).toHaveBeenCalledTimes(1)
		const cmd = sendMock.mock.calls[0][0]
		expect(cmd.input.Key).toBe('some/path/image.png')
	})

	it('replaceImage uploads new file then attempts to delete old url', async () => {
		// Prepare blob/file-like object
		const blob = new Blob([new Uint8Array([4, 5, 6])], { type: 'image/jpeg' })
		;(blob as any).name = 'plant.jpg'
		// First call: upload result; second call: delete old image
		sendMock
			.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } }) // upload
			.mockResolvedValueOnce({ $metadata: { httpStatusCode: 204 } }) // delete
		const result = await uploadModule.replaceImage('https://bucket.example/old/old.jpg', blob)
		expect(result).toHaveProperty('url')
		expect(result).toHaveProperty('key')
		expect(result.url).toContain('https://bucket.example/')
		expect(sendMock).toHaveBeenCalledTimes(2)
		const uploadCmd = sendMock.mock.calls[0][0]
		expect(uploadCmd.input.ContentType).toBe('image/jpeg')
		// delete call should have been passed the old key
		const deleteCmd = sendMock.mock.calls[1][0]
		expect(deleteCmd.input.Key).toEqual(expect.stringContaining('old/old.jpg'))
	})
})

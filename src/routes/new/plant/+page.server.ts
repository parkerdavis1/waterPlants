import env from 'src/lib/env.js'
import db from 'src/db'
import { desc, eq, and, sql } from 'drizzle-orm'
import { plant, room } from 'src/db/schema'
import s3Client from 'src/lib/s3Client.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { superValidate, fail, message, setError, withFiles } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { newPlantSchema } from 'src/lib/zodSchemas/plantSchema'
import { redirect } from '@sveltejs/kit'

export async function load() {
	const rooms = await db.select().from(room)

	return {
		rooms,
		newPlantForm: await superValidate(zod(newPlantSchema)),
	}
}

export const actions = {
	newPlant: async ({ request }) => {
		// delay for testing
		// await new Promise((resolve) => setTimeout(resolve, 1000))
		
		// test failure
		// return fail(400, { form: 'test' })
		const formData = await request.formData()
		console.dir(formData, { depth: 10 })
		
		const form = await superValidate(formData, zod(newPlantSchema), { allowFiles: true })
		console.dir(form, { depth: 10 })
		
		if (!form.valid) return fail(400, withFiles({ form }))
			
		const [insertedPlant] = await db.insert(plant).values(form.data).returning()
		if (!insertedPlant) return fail(400, { form })

		if (form.data.image) {
			console.log('\nStarting image upload to bucket...')

			// Image upload
			const image = form.data.image

			const fileBuffer = await image.arrayBuffer()
			const fileName = `${Date.now()}-${image.name}`

			try {
				const command = new PutObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: fileName,
					Body: Buffer.from(fileBuffer),
					ContentType: image.type,
				})

				await s3Client.send(command)

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName
				const resultAfterUpload = await db
					.update(plant)
					.set({ image_url: imageUrl })
					.where(eq(plant.id, insertedPlant.id))
					.returning()
				console.log('Image uploaded...', resultAfterUpload)
			} catch (error) {
				console.error('Image upload error: ', error)
				return fail(500, withFiles({ form }))
				// return setError(form, 'form', 'Failed to upload image')
			}
			// return message(form, 'Image uploaded successfully')
		}
		return redirect(302, '/');
		// return message(form, 'new plant')
	},
}

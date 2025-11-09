import env from 'src/lib/env.js'
import db from 'src/db'
import { and, desc, eq, sql } from 'drizzle-orm'
import { plant, room, watering_event } from 'src/db/schema'
import s3Client from 'src/lib/s3Client.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { fail, message, setError, superValidate, withFiles } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { newPlantSchema } from 'src/lib/zodSchemas/plantSchema'
import { redirect } from '@sveltejs/kit'

export async function load() {
	return {
		newPlantForm: await superValidate(zod(newPlantSchema)),
	}
}

export const actions = {
	newPlant: async ({ request, locals }) => {
		// delay for testing
		// await new Promise((resolve) => setTimeout(resolve, 1000))

		// test failure
		// return fail(400, { form: 'test' })
		const formData = await request.formData()

		const form = await superValidate(formData, zod(newPlantSchema), {
			allowFiles: true,
		})

		if (!form.valid) return fail(400, withFiles({ form }))

		const [insertedPlant] = await db.insert(plant).values(form.data).returning()
		if (!insertedPlant) return fail(400, { form })

		if (form.data.image) {
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

				// Create initial watering event with photo
				await db.insert(watering_event).values({
					plant_id: insertedPlant.id,
					user_id: locals.user.id,
					image_url: imageUrl,
				})
			} catch (error) {
				console.error('\nImage upload error: ', error)
				return fail(500, withFiles({ form }))
				// return setError(form, 'form', 'Failed to upload image')
			}
			// return message(form, 'Image uploaded successfully')
		}
		return redirect(302, '/')
		// return message(form, 'new plant')
	},
}

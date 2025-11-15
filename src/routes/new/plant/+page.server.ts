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
import { uploadImageFile } from 'src/lib/uploadImage.js'

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
			try {
				const { url: image_url } = await uploadImageFile(form.data.image)
				await db.update(plant).set({ image_url }).where(eq(plant.id, insertedPlant.id))
				await db.insert(watering_event).values({
					plant_id: insertedPlant.id,
					user_id: locals.user.id,
					image_url: image_url,
				})
			} catch (error) {
				console.error('\nImage upload error: ', error)
				return fail(500, withFiles({ form }))
			}
		}
		return redirect(302, '/')
		// return message(form, 'new plant')
	},
}

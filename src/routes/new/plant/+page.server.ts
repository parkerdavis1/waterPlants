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

		let image_url: string | undefined
		if (form.data.image) {
			try {
				const uploaded = await uploadImageFile(form.data.image)
				image_url = uploaded.url
			} catch (error) {
				console.error('\nImage upload error: ', error)
				return fail(500, withFiles({ form }))
			}
		}

		const { image, ...plantFields } = form.data
		const [insertedPlant] = await db
			.insert(plant)
			.values({ ...plantFields, ...(image_url ? { image_url } : {}) })
			.returning()
		if (!insertedPlant) return fail(400, { form })

		if (image_url) {
			await db.insert(watering_event).values({
				plant_id: insertedPlant.id,
				user_id: locals.user.id,
				image_url,
			})
		}

		return redirect(302, '/')
		// return message(form, 'new plant')
	},
}

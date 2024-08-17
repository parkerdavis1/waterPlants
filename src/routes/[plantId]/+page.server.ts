import env from 'src/lib/env'
import db from 'src/db'
import { eq, desc } from 'drizzle-orm'
import { plant, room, watering_event } from 'src/db/schema.js'
import { editPlantSchema, plantEventSchema } from 'src/lib/zodSchemas/plantSchema'
import { fail, message, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import s3Client from 'src/lib/s3Client'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { redirect } from '@sveltejs/kit'

export async function load({ params }) {
	const { plantId } = params
	const plantIdInt = parseInt(plantId)
	const [plantData] = await db.select().from(plant).where(eq(plant.id, plantIdInt)).limit(1)
	// const wateringEvents = await db
	// 	.select()
	// 	.from(watering_event)
	// 	.where(eq(watering_event.plant_id, plantIdInt));
	const wateringEvents = await db
		.select()
		.from(watering_event)
		.where(eq(watering_event.plant_id, plantIdInt))
		.orderBy(desc(watering_event.timestamp))

	const rooms = await db.select().from(room)

	return {
		plant: plantData,
		wateringEvents,
		editForm: await superValidate(plantData, zod(editPlantSchema)),
		waterForm: await superValidate(zod(plantEventSchema)),
		rooms,
	}
}

export const actions = {
	water: async ({ request }) => {
		const form = await superValidate(request, zod(plantEventSchema))
		console.log('form', form)

		if (!form.valid) return fail(400, { form })

		const [insertedWaterEvent] = await db.insert(watering_event).values(form.data).returning()
		if (!insertedWaterEvent) return fail(400, { form })

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
				console.log('imageUrl', imageUrl)
				const resultAfterUpload = await db
					.update(watering_event)
					.set({ image_url: imageUrl })
					.where(eq(watering_event.id, insertedWaterEvent.id))
					.returning()
				console.log('Image uploaded...', resultAfterUpload)
			} catch (error) {
				console.error('Upload error: ', error)
				return fail(500, { form })
			}
		}
		// return message(form, 'Success...');
		return redirect(302, '/')
	},

	editPlant: async ({ request }) => {
		const form = await superValidate(request, zod(editPlantSchema))

		if (!form.valid) return fail(400, { form })

		console.log('form.data.id', form.data.id)

		const [result] = await db
			.update(plant)
			.set(form.data)
			.where(eq(plant.id, form.data.id))
			.returning()

		console.log('result', result)
		if (form.data.image) {
			const oldImageUrl = form.data.oldImageUrl

			// Image upload
			const image = form.data.image

			const fileBuffer = await image.arrayBuffer()
			const fileName = `${Date.now()}-${image.name}`

			try {
				const uploadCommand = new PutObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: fileName,
					Body: Buffer.from(fileBuffer),
					ContentType: image.type,
				})

				await s3Client.send(uploadCommand)

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName
				console.log('imageUrl', imageUrl)

				const resultAfterUpload = await db
					.update(plant)
					.set({ image_url: imageUrl })
					.where(eq(plant.id, result.id))
					.returning()

				console.log('Image uploaded...', resultAfterUpload)

				// TODO: Remove old image
				if (oldImageUrl) {
					const oldImageKey = new URL(oldImageUrl).pathname.slice(1)
					console.log('old image key', oldImageKey)

					const deleteCommand = new DeleteObjectCommand({
						Bucket: env.R2_BUCKET_NAME,
						Key: oldImageKey,
					})

					const deleteResult = await s3Client.send(deleteCommand)
					console.log('deleteResult', deleteResult)
				}
			} catch (error) {
				console.error('Upload error: ', error)
				return fail(500, { form })
			}
			return message(form, 'Image uploaded successfully')
		}

		return {
			form,
		}
	},

	deletePlant: async ({ request }) => {
		const data = await request.formData()
		const id = data.get('id')
		console.log('id', id)

		if (!id) {
			console.log('Error deleting plant')
			return
		}

		const plantId = parseInt(id)

		console.log('plantId', plantId)

		await db.delete(plant).where(eq(plant.id, plantId))

		return redirect(302, '/')
	},
}

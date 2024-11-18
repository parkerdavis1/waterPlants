import env from 'src/lib/env.js'
import db from 'src/db'
import { desc, eq, and, sql, inArray } from 'drizzle-orm'
import { plant, room, user, watering_event } from 'src/db/schema'

import s3Client from 'src/lib/s3Client.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'

import { superValidate, fail, message, setError } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { waterPlantSchema } from 'src/lib/zodSchemas/plantSchema'
import { json } from '@sveltejs/kit'
import { multiWateringFormSchema } from 'src/lib/zodSchemas/waterManyForm.js'

interface PlantData {
	plant: {
		id: number
		name: string
		species: string | null
		water_schedule: number
		image_url: string | null
		house_id: number
		room_id: number
		created_at: number
	}
	watering_event: {
		id: number
		notes: string
		fertilized: boolean
		image_url: string | null
		plant_id: number
		user_id: number
		timestamp: number
	}
}

export async function load({ cookies }) {
	// Get plants with their most recent watering data
	const plantsWater = await db
		.select()
		.from(plant)
		.leftJoin(
			watering_event,
			and(
				eq(plant.id, watering_event.plant_id),
				eq(
					watering_event.id,
					db
						.select({ id: watering_event.id })
						.from(watering_event)
						.where(and(eq(watering_event.watered, true), eq(watering_event.plant_id, plant.id)))
						.orderBy(desc(watering_event.timestamp))
						.limit(1),
				),
			),
		)

	const dueDatePlantsWater = plantsWater
		.map((obj) => ({
			...obj,
			dueDate: getDueDate(obj.watering_event?.timestamp, obj.plant.water_schedule),
		}))
		.sort((a, b) => a.dueDate - b.dueDate)

	const roomIds = (await db.selectDistinct({ room_id: plant.room_id }).from(plant)).map(
		(r) => r.room_id,
	)
	// console.log('roomResult', roomResult)
	// const roomIds = roomResult.map(r => r.room_id)
	let rooms
	if (roomIds.length > 0) {
		rooms = await db.select().from(room).where(inArray(room.id, roomIds))
	}

	return {
		plantsWater: dueDatePlantsWater,
		rooms,
		// userId,
		form: await superValidate(zod(multiWateringFormSchema)),
		// newPlantForm: await superValidate(zod(waterPlantSchema))
	}
}

export const actions = {
	newPlant: async ({ request }) => {
		const form = await superValidate(request, zod(waterPlantSchema))
		if (!form.valid) return fail(400, { form })

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
				console.log('imageUrl', imageUrl)
				const resultAfterUpload = await db
					.update(plant)
					.set({ image_url: imageUrl })
					.where(eq(plant.id, insertedPlant.id))
					.returning()
				console.log('Image uploaded...', resultAfterUpload)
			} catch (error) {
				console.error('Upload error: ', error)
				return fail(500, { form })
			}
			return message(form, 'Image uploaded successfully')
		}

		return { form }
	},

	waterPlants: async ({ request }) => {
		console.log('watering plants!')
		const form = await superValidate(request, zod(multiWateringFormSchema))
		console.log('form', form)
		if (!form.valid) {
			return fail(400, { form })
		}
		console.log('watering plants!')

		try {
			await Promise.all(
				form.data.plantIds.map((plantId) =>
					db.insert(watering_event).values({
						plant_id: plantId,
						user_id: form.data.userId,
						watered: true,
					}),
				),
			)
			return { form }
		} catch (error) {
			console.log('e', error)
			return fail(500, { form, error: 'Failed to create watering events' })
		}
	},
}

function getDueDate(eventTime: number | undefined, period: number) {
	if (!eventTime) return new Date().getTime()
	const unixPeriod = period * 1000 * 60 * 60 * 24
	return eventTime + unixPeriod
}

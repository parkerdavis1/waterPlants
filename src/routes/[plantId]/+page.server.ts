import env from 'src/lib/env'
import db from 'src/db'
import { desc, eq } from 'drizzle-orm'
import { plant, watering_event } from 'src/db/schema.js'
import {
	deleteEventSchema,
	deletePlantSchema,
	editPlantSchema,
	plantEventSchema,
	editEventSchema,
} from 'src/lib/zodSchemas/plantSchema'
import { fail, message, superValidate, withFiles } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { DAY_MILLISECONDS } from 'src/lib/utils/constants'
import s3Client from 'src/lib/s3Client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { redirect } from '@sveltejs/kit'
import { getProgressPercent } from 'src/lib/utils/getProgressPercent.js'
import { deleteImageByUrl, uploadImageFile } from 'src/lib/uploadImage'

export async function load({ params, parent }) {
	const { plantId } = params
	const plantIdInt = parseInt(plantId)

	const wateringEvents = db
		.select()
		.from(watering_event)
		.where(eq(watering_event.plant_id, plantIdInt))
		.orderBy(desc(watering_event.timestamp))

	const plantDataPromise = db.select().from(plant).where(eq(plant.id, plantIdInt)).limit(1)

	// resolve both db calls
	const [plantDataResolved, wateringEventsResolved] = await Promise.all([
		plantDataPromise,
		wateringEvents,
	])

	if (!plantDataPromise) {
		return fail(404, {
			message: 'Plant not found',
		})
	}

	const plantData = plantDataResolved[0]

	// Last Watering Event
	const lastWateringEvent = wateringEventsResolved.filter(
		(event) => event.watered === true || event.waitUntil,
	)[0]
	const milliseconds = new Date().getTime() - new Date(lastWateringEvent?.timestamp).getTime()

	const days = Math.round(milliseconds / DAY_MILLISECONDS)

	// Water Progress Percent
	const waterProgressPercent = getProgressPercent(lastWateringEvent, plantData)

	// Last Photo Event
	const lastPhotoEvent = wateringEventsResolved.filter((event) => event.image_url)[0]
	const daysSinceLastPhoto = lastPhotoEvent
		? Math.round(
				(new Date().getTime() - new Date(lastPhotoEvent.timestamp).getTime()) / DAY_MILLISECONDS,
			)
		: Infinity

	return {
		plant: {
			...plantData,
			daysSinceLastWatered: days,
			waterProgressPercent,
			daysSinceLastPhoto,
			// room_name: rooms.find((room) => room.id === plantData.room_id)
			// 	?.name,
		},
		wateringEvents: await wateringEvents,
		editForm: await superValidate(plantData, zod(editPlantSchema)),
		waterForm: await superValidate(zod(plantEventSchema)),
		editEventForm: await superValidate(zod(editEventSchema)),
		deleteEvent: await superValidate(zod(deleteEventSchema)),
		deletePlant: await superValidate(zod(deletePlantSchema)),
	}
}

export const actions = {
	water: async ({ request }) => {
		const form = await superValidate(request, zod(plantEventSchema))

		if (!form.valid) return fail(400, { form })

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

		const { image: _image, ...eventFields } = form.data
		const [insertedWaterEvent] = await db
			.insert(watering_event)
			.values({ ...eventFields, image_url })
			.returning()
		if (!insertedWaterEvent) return fail(400, { form })

		return message(form, 'Success...')
	},

	editPlant: async ({ request, locals }) => {
		const form = await superValidate(request, zod(editPlantSchema))

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
		const [result] = await db
			.update(plant)
			.set({ ...plantFields, ...(image_url ? { image_url } : {}) })
			.where(eq(plant.id, form.data.id))
			.returning()

		if (image_url) {
			await db.insert(watering_event).values({
				plant_id: result.id,
				user_id: locals.user.id,
				image_url,
			})
		}

		return withFiles({ form })
	},

	deletePlant: async ({ request }) => {
		const form = await superValidate(request, zod(deletePlantSchema))

		if (!form.valid) return fail(400, { form })

		if (form.data.image_url) {
			const ok = await deleteImageByUrl(form.data.image_url)
			if (!ok) return fail(500, { form })
		}

		await db.delete(plant).where(eq(plant.id, form.data.id))

		// TODO: cleanup, delete associated events and associated event images as well.
		// This could possibly be partially handled with database cascades...

		return redirect(302, '/')
	},

	editEvent: async ({ request }) => {
		const form = await superValidate(request, zod(editEventSchema))

		if (!form.valid) return fail(400, withFiles({ form }))

		let image_url: string | undefined
		if (form.data.image) {
			try {
				const uploaded = await uploadImageFile(form.data.image)
				image_url = uploaded.url
			} catch (error) {
				console.error('\nImage upload error: ', error)
				return fail(500, withFiles(form))
			}
		}
		const [result] = await db
			.update(watering_event)
			.set({
				notes: form.data.notes,
				fertilized: form.data.fertilized,
				watered: form.data.watered,
				waitUntil: form.data.waitUntil,
				timestamp: form.data.timestamp,
				...(image_url ? { image_url } : {}),
			})
			.where(eq(watering_event.id, form.data.id))
			.returning()

		return withFiles({ form })
	},

	deleteEvent: async ({ request }) => {
		const form = await superValidate(request, zod(deleteEventSchema))
		if (!form.valid) return fail(400, { form })

		const wateringId = form.data.id
		// const plantId = form.data.plantId

		await db.delete(watering_event).where(eq(watering_event.id, wateringId))

		return { deleteEvent: form }
	},
}

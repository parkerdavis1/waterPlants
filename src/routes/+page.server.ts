import env from 'src/lib/env.js'
import db from 'src/db'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { plant, room, watering_event } from 'src/db/schema'
// import * as auth from '$lib/server/auth'

import s3Client from 'src/lib/s3Client.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'

import { fail, message, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { newPlantSchema } from 'src/lib/zodSchemas/plantSchema'
import { redirect } from '@sveltejs/kit'
import { multiWateringFormSchema } from 'src/lib/zodSchemas/waterManyForm.js'

export async function load({ locals }) {
	if (!locals.user) {
		return redirect(302, '/login')
	}

	return {
		form: await superValidate(zod(multiWateringFormSchema)),
	}
}

export const actions = {
	waterPlants: async ({ request }) => {
		const form = await superValidate(request, zod(multiWateringFormSchema))
		if (!form.valid) {
			return fail(400, { form })
		}

		try {
			await Promise.all(
				form.data.plantIds.map((plantId) =>
					db.insert(watering_event).values({
						plant_id: plantId,
						user_id: form.data.userId,
						notes: form.data.notes,
						timestamp: form.data.timestamp,
						watered: true,
					}),
				),
			)
			return { form }
		} catch (error) {
			console.error('e', error)
			return fail(500, {
				form,
				error: 'Failed to create watering events',
			})
		}
	},
}

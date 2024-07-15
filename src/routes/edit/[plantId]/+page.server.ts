import { PutObjectCommand } from '@aws-sdk/client-s3';
import { redirect } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import db from 'src/db';
import { plant, room, watering_event } from 'src/db/schema.js';
import env from 'src/lib/env';
import { editPlantSchema, plantSchema } from 'src/lib/formSchemas/plantSchema.js';
import { waterPlantSchema } from 'src/lib/formSchemas/waterPlantSchema';
import s3Client from 'src/lib/s3Client';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load({ params }) {
	const { plantId } = params;
	const plantIdInt = parseInt(plantId);
	const [plantData] = await db.select().from(plant).where(eq(plant.id, plantIdInt)).limit(1);
	const wateringEvents = await db
		.select()
		.from(watering_event)
		.where(eq(watering_event.plant_id, plantIdInt));

	// const wateringEvents = await db
	// 	.select()
	// 	.from(watering_event)
	// 	.where(eq(watering_event.plant_id, plantIdInt))
	// 	.orderBy(desc(watering_event.timestamp));

	const rooms = await db.select().from(room);

	return {
		plant: plantData,
		wateringEvents,
		rooms,
		form: await superValidate(plantData, zod(editPlantSchema))
	};
}

export const actions = {
	editPlant: async ({ request }) => {
		const form = await superValidate(request, zod(editPlantSchema));

		if (!form.valid) return fail(400, { form });

		console.log('form.data.id', form.data.id);

		const result = await db
			.update(plant)
			.set(form.data)
			.where(eq(plant.id, form.data.id))
			.returning();

		console.log('result', result);

		return {
			form
		};
	},

	deletePlant: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		console.log('id', id);

		if (!id) {
			console.log('Error deleting plant');
			return;
		}

		const plantId = parseInt(id);

		console.log('plantId', plantId);

		await db.delete(plant).where(eq(plant.id, plantId));

		return redirect(302, '/');
	}
};

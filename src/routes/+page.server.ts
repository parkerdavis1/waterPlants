import env from 'src/lib/env.js';
import db from 'src/db';
import { desc, eq, and } from 'drizzle-orm';
import { plant, room, watering_event } from 'src/db/schema';

import s3Client from 'src/lib/s3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { waterPlantSchema } from 'src/lib/formSchemas/waterPlantSchema';
import { newPlantSchema } from 'src/lib/formSchemas/newPlantSchema.js';

export async function load() {
	// TODO: add column for fertilization data
	// TODO: calculate watering due date and add that column, for sorting?

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
						.where(eq(watering_event.plant_id, plant.id))
						.orderBy(desc(watering_event.timestamp))
						.limit(1)
				)
			)
		);

	const rooms = await db.select().from(room);

	return {
		plantsWater,
		rooms,
		form: await superValidate(zod(waterPlantSchema)),
		newPlantForm: await superValidate(zod(newPlantSchema))
	};
}

export const actions = {
	newPlant: async ({ request }) => {
		const form = await superValidate(request, zod(newPlantSchema));
		if (!form.valid) return fail(400, { form });

		const [insertedPlant] = await db.insert(plant).values(form.data).returning();
		console.log('insertedPlant', insertedPlant);
		return { form };
	},

	water: async ({ request }) => {
		const form = await superValidate(request, zod(waterPlantSchema));
		console.log('form', form);

		if (!form.valid) return fail(400, { form });

		const [insertedWaterEvent] = await db.insert(watering_event).values(form.data).returning();
		if (!insertedWaterEvent) return fail(400, { form });

		if (form.data.image) {
			// Image upload
			const image = form.data.image;

			const fileBuffer = await image.arrayBuffer();
			const fileName = `${Date.now()}-${image.name}`;

			try {
				const command = new PutObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: fileName,
					Body: Buffer.from(fileBuffer),
					ContentType: image.type
				});

				await s3Client.send(command);

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName;
				console.log('imageUrl', imageUrl);
				const resultAfterUpload = await db
					.update(watering_event)
					.set({ image_url: imageUrl })
					.where(eq(watering_event.id, insertedWaterEvent.id))
					.returning();
				console.log('Image uploaded...', resultAfterUpload);
			} catch (error) {
				console.error('Upload error: ', error);
				return fail(500, { form });
			}
		}
	}
};

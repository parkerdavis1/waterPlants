import env from 'src/lib/env.js';
import db from 'src/db';
import { desc, eq, and } from 'drizzle-orm';
import { plant, watering_event } from 'src/db/schema';

import s3Client from 'src/lib/s3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { waterPlantSchema } from 'src/lib/formSchemas/waterPlantSchema';

export async function load() {
	// Get plants with their most recent watering data
	const plants = await db
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

	return {
		plants,
		form: await superValidate(zod(waterPlantSchema))
	};
}

export const actions = {
	water: async ({ request }) => {
		const form = await superValidate(request, zod(waterPlantSchema));
		console.log('form', form);

		if (!form.valid) return fail(400, { form });

		const [insertedWaterEvent] = await db.insert(watering_event).values(form.data).returning();
		if (!insertedWaterEvent) return;

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
		return message(form, 'Successful upload!');
	}
};

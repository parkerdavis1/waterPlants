import { PutObjectCommand } from '@aws-sdk/client-s3';
import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import db from 'src/db';
import { plant, watering_event } from 'src/db/schema.js';
import env from 'src/lib/env';
import { waterPlantSchema, plantEventSchema } from 'src/lib/zodSchemas/plantSchema';
import s3Client from 'src/lib/s3Client';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load({ params }) {
	const { plantId } = params;
	const plantIdInt = parseInt(plantId);
	const [plantData] = await db.select().from(plant).where(eq(plant.id, plantIdInt)).limit(1);
	// const wateringEvents = await db
	// 	.select()
	// 	.from(watering_event)
	// 	.where(eq(watering_event.plant_id, plantIdInt));
	const wateringEvents = await db
		.select()
		.from(watering_event)
		.where(eq(watering_event.plant_id, plantIdInt))
		.orderBy(desc(watering_event.timestamp));

	return {
		plant: plantData,
		wateringEvents,
		form: await superValidate(zod(plantEventSchema)),
		randomNumber: Math.random()
	};
}

export const actions = {
	water: async ({ request }) => {
		const form = await superValidate(request, zod(plantEventSchema));
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
		// return message(form, 'Success...');
		return redirect(302, '/');
	}
};

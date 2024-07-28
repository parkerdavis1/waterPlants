import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import db from 'src/db';
import { plant, room, watering_event } from 'src/db/schema.js';
import env from 'src/lib/env';
import { editPlantSchema } from 'src/lib/zodSchemas/plantSchema';
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
		.where(eq(watering_event.plant_id, plantIdInt))
		.orderBy(desc(watering_event.timestamp));

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

		const [result] = await db
			.update(plant)
			.set(form.data)
			.where(eq(plant.id, form.data.id))
			.returning();

		console.log('result', result);
		if (form.data.image) {
			const oldImageUrl = form.data.oldImageUrl;

			// Image upload
			const image = form.data.image;

			const fileBuffer = await image.arrayBuffer();
			const fileName = `${Date.now()}-${image.name}`;

			try {
				const uploadCommand = new PutObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: fileName,
					Body: Buffer.from(fileBuffer),
					ContentType: image.type
				});

				await s3Client.send(uploadCommand);

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName;
				console.log('imageUrl', imageUrl);

				const resultAfterUpload = await db
					.update(plant)
					.set({ image_url: imageUrl })
					.where(eq(plant.id, result.id))
					.returning();

				console.log('Image uploaded...', resultAfterUpload);

				// TODO: Remove old image
				const deleteCommand = new DeleteObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: oldImageUrl
				});
				const deleteResult = await s3Client.send(deleteCommand);
				console.log('deleteResult', deleteResult);
			} catch (error) {
				console.error('Upload error: ', error);
				return fail(500, { form });
			}
			return message(form, 'Image uploaded successfully');
		}

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

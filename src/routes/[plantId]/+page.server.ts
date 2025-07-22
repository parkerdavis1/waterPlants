import env from "src/lib/env";
import db from "src/db";
import { desc, eq, sql } from "drizzle-orm";
import { plant, room, user, watering_event } from "src/db/schema.js";
import {
	deleteEventSchema,
	deletePlantSchema,
	editPlantSchema,
	plantEventSchema,
} from "src/lib/zodSchemas/plantSchema";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { DAY_MILLISECONDS } from "src/lib/utils/constants";

import s3Client from "src/lib/s3Client";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { json, redirect } from "@sveltejs/kit";

export async function load({ params, parent }) {
	const { plantId } = params;
	const plantIdInt = parseInt(plantId);

	const wateringEvents = db
		.select()
		.from(watering_event)
		.where(eq(watering_event.plant_id, plantIdInt))
		.orderBy(desc(watering_event.timestamp));

	const plantDataPromise = db.select().from(plant).where(
		eq(plant.id, plantIdInt),
	).limit(1);

	// resolve both db calls
	const [plantDataResolved, wateringEventsResolved] = await Promise.all([
		plantDataPromise,
		wateringEvents,
	]);

	if (!plantDataPromise) {
		return fail(404, {
			message: "Plant not found",
		});
	}
	const plantData = plantDataResolved[0];
	const lastWateringEvent =
		wateringEventsResolved.filter((event) => event.watered === true)[0];
	const milliseconds = new Date().getTime() -
		new Date(lastWateringEvent?.timestamp).getTime();
	const days = Math.round(milliseconds / DAY_MILLISECONDS);

	const waterProgressPercent = lastWateringEvent?.timestamp
		? 100 -
			(milliseconds / (plantData.water_schedule *
					DAY_MILLISECONDS)) *
				100
		: 0;

	return {
		plant: {
			...plantData,
			daysSinceLastWatered: days,
			waterProgressPercent,
			// room_name: rooms.find((room) => room.id === plantData.room_id)
			// 	?.name,
		},
		wateringEvents: await wateringEvents,
		editForm: await superValidate(plantData, zod(editPlantSchema)),
		waterForm: await superValidate(zod(plantEventSchema)),
		deleteEvent: await superValidate(zod(deleteEventSchema)),
		deletePlant: await superValidate(zod(deletePlantSchema)),
	};
}

export const actions = {
	water: async ({ request }) => {
		console.log("\nrequest", request);
		// console.log("\nform pre-validation", await request.formData());
		const form = await superValidate(request, zod(plantEventSchema));
		console.log("\nform from water server action", form);

		if (!form.valid) return fail(400, { form });

		// 	// update plant and change water_schedule to whatever it is currently + wait number
		// if (form.data.wait) {
		// 	const res = await db
		// 		.update(plant)
		// 		.set({
		// 			water_schedule: sql`water_schedule + ${form.data.wait}`,
		// 		})
		// 		.where(eq(plant.id, form.data.plant_id));

		// 	if (!res) return fail(400, { form });
		// }

		const [insertedWaterEvent] = await db.insert(watering_event).values(
			form.data,
		).returning();
		if (!insertedWaterEvent) return fail(400, { form });

		if (form.data.image) {
			console.log("Image found! will upload to R2...");
			// Image upload
			const image = form.data.image;

			const fileBuffer = await image.arrayBuffer();
			const fileName = `${Date.now()}-${image.name}`;

			try {
				const command = new PutObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: fileName,
					Body: Buffer.from(fileBuffer),
					ContentType: image.type,
				});

				await s3Client.send(command);

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName;
				console.log("imageUrl", imageUrl);
				const resultAfterUpload = await db
					.update(watering_event)
					.set({ image_url: imageUrl })
					.where(eq(watering_event.id, insertedWaterEvent.id))
					.returning();
				console.log("Image uploaded...", resultAfterUpload);
			} catch (error) {
				console.error("Upload error: ", error);
				return fail(500, { form });
			}
		}
		return message(form, "Success...");
	},

	editPlant: async ({ request }) => {
		const form = await superValidate(request, zod(editPlantSchema));

		if (!form.valid) return fail(400, { form });

		console.log("form.data.id", form.data.id);

		const [result] = await db
			.update(plant)
			.set(form.data)
			.where(eq(plant.id, form.data.id))
			.returning();

		console.log("result", result);
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
					ContentType: image.type,
				});

				await s3Client.send(uploadCommand);

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName;
				console.log("imageUrl", imageUrl);

				const resultAfterUpload = await db
					.update(plant)
					.set({ image_url: imageUrl })
					.where(eq(plant.id, result.id))
					.returning();

				console.log("Image uploaded...", resultAfterUpload);

				// TODO: Remove old image
				if (oldImageUrl) {
					const oldImageKey = new URL(oldImageUrl).pathname.slice(1);
					console.log("old image key", oldImageKey);

					const deleteCommand = new DeleteObjectCommand({
						Bucket: env.R2_BUCKET_NAME,
						Key: oldImageKey,
					});

					const deleteResult = await s3Client.send(deleteCommand);
					console.log("deleteResult", deleteResult);
				}
			} catch (error) {
				console.error("Upload error: ", error);
				return fail(500, { form });
			}
			return message(form, "Image uploaded successfully");
		}

		return {
			form,
		};
	},

	deletePlant: async ({ request }) => {
		const form = await superValidate(request, zod(deletePlantSchema));

		console.log("form", form);

		if (!form.valid) return fail(400, { form });

		// const data = await request.formData()
		// const id = data.get('id') as string

		// if (!id) {
		// 	console.log('Error deleting plant')
		// 	return
		// }

		// const plantId = parseInt(id)

		// check if there is an image to delete
		// const plant = await db.select().from(plant).where(eq(plant.id, plantId)).limit(1)

		if (form.data.image_url) {
			// use s3 sdk to delete image
			const imageKey = form.data.image_url.split("/").at(-1);
			console.log("imageKey", imageKey);

			const deleteCommand = new DeleteObjectCommand({
				Bucket: env.R2_BUCKET_NAME,
				Key: imageKey,
			});

			const deleteResult = await s3Client.send(deleteCommand);
			if (deleteResult.$metadata.httpStatusCode !== 204) {
				return fail(500, { form });
			}
		}

		await db.delete(plant).where(eq(plant.id, form.data.id));

		return redirect(302, "/");
	},

	deleteEvent: async ({ request }) => {
		const form = await superValidate(request, zod(deleteEventSchema));
		if (!form.valid) return fail(400, { form });
		console.log("form", form);

		const wateringId = form.data.id;
		const plantId = form.data.plantId;
		console.log("wateringId", wateringId);
		console.log("plantId", plantId);

		const result = await db.delete(watering_event).where(
			eq(watering_event.id, wateringId),
		);
		console.log("db result", result);

		return { deleteEvent: form };
	},
};

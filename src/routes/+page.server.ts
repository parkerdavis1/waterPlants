import env from "src/lib/env.js";
import db from "src/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import { plant, room, watering_event } from "src/db/schema";
// import * as auth from '$lib/server/auth'

import s3Client from "src/lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { newPlantSchema } from "src/lib/zodSchemas/plantSchema";
import { redirect } from "@sveltejs/kit";
import { multiWateringFormSchema } from "src/lib/zodSchemas/waterManyForm.js";

export async function load({ locals }) {
	if (!locals.user) {
		return redirect(302, "/login");
	}

	return {
		form: await superValidate(zod(multiWateringFormSchema)),
	};
}

export const actions = {
	newPlant: async ({ request }) => {
		const form = await superValidate(request, zod(newPlantSchema));
		if (!form.valid) return fail(400, { form });

		const [insertedPlant] = await db.insert(plant).values(form.data)
			.returning();
		if (!insertedPlant) return fail(400, { form });

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
					ContentType: image.type,
				});

				await s3Client.send(command);

				const imageUrl = env.R2_BUCKET_BASE_URL + fileName;
				console.log("imageUrl", imageUrl);
				const resultAfterUpload = await db
					.update(plant)
					.set({ image_url: imageUrl })
					.where(eq(plant.id, insertedPlant.id))
					.returning();
				console.log("Image uploaded...", resultAfterUpload);
			} catch (error) {
				console.error("Upload error: ", error);
				return fail(500, { form });
			}
			return message(form, "Image uploaded successfully");
		}

		return { form };
	},

	waterPlants: async ({ request }) => {
		console.log("watering plants!");
		const form = await superValidate(request, zod(multiWateringFormSchema));
		console.log("form", form);
		if (!form.valid) {
			return fail(400, { form });
		}
		console.log("watering plants!");

		try {
			await Promise.all(
				form.data.plantIds.map((plantId) =>
					db.insert(watering_event).values({
						plant_id: plantId,
						user_id: form.data.userId,
						notes: form.data.notes,
						timestamp: form.data.timestamp,
						watered: true,
					})
				),
			);
			return { form };
		} catch (error) {
			console.log("e", error);
			return fail(500, {
				form,
				error: "Failed to create watering events",
			});
		}
	},
};

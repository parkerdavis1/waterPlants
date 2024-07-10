import db from 'src/db';
import { plant } from 'src/db/schema';
import s3Client from 'src/lib/s3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import env from 'src/lib/env.js';
import { error } from '@sveltejs/kit';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { imageSchema } from 'src/lib/formSchemas/imageSchema.js';

export async function load() {
	const plants = await db.select().from(plant);
	return {
		plants: plants,
		form: await superValidate(zod(imageSchema))
	};
}

export const actions = {
	upload: async ({ request }) => {
		console.log('Upload starting...');

		const form = await superValidate(request, zod(imageSchema));

		if (!form.valid) return fail(400, { form });

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
			return message(form, 'You have uploaded a file!');
		} catch (error) {
			console.error('Upload error: ', error);
			return fail(500, { form });
		}
	}
};

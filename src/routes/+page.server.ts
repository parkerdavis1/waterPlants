import db from 'src/db';
import { plant } from 'src/db/schema';
import s3Client from 'src/lib/s3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import env from 'src/lib/env.js';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
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

			// TODO: save url to database for later retrieval
			const imageUrl = env.R2_BUCKET_BASE_URL + fileName;
			console.log('imageUrl', imageUrl);

			return message(form, 'Successful upload!');
		} catch (error) {
			console.error('Upload error: ', error);
			return fail(500, { form });
		}
	}
};

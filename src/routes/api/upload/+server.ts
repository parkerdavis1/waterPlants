import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { json } from '@sveltejs/kit';
import env from 'src/lib/env';

// const s3Client = new S3Client({
// 	region: 'auto',
// 	endpoint: env.R2_ENDPOINT,
// 	credentials: {
// 		accessKeyId: env.R2_ACCESS_KEY_ID,
// 		secretAccessKey: env.R2_SECRET_ACCESS_KEY
// 	}
// });

// console.log('s3Client', s3Client);

export async function POST({ request }) {
	console.log('\nStarting upload...\n');
	const formData = await request.formData();
	const file = formData?.get('file') as File;
	console.log('file', file);
	console.log('file instanceof File', file instanceof File);

	if (!file || !(file instanceof File)) return json({ error: 'No file uploaded' }, { status: 400 });

	const fileBuffer = await file.arrayBuffer();
	const fileName = `${Date.now()}-${file.name}`;

	try {
		const command = new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: fileName,
			Body: Buffer.from(fileBuffer),
			ContentType: file.type
		});

		console.log('command', command);

		await s3Client.send(command);

		console.log('\nsent?\n');

		return json({ success: true, fileName });
	} catch (error) {
		console.error('Upload error: ', error);
		return json({ error: 'Upload failed' }, { status: 500 });
	}
}

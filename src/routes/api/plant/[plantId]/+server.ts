import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import db from 'src/db/index';
import { plantImage } from 'src/db/schema';

export const GET = async ({ params }) => {
	if (!params.plantId) {
		throw error(404, {
			message: 'Plant not found'
		});
	}
	const plantId = parseInt(params.plantId);
	console.log('plantId', plantId);

	const result = await db
		.select()
		.from(plantImage)
		.where(eq(plantImage.plant_id, plantId))
		.limit(1);
	const image = result[0].data ?? null;
	if (!image) {
		throw error(404, 'image not found');
	}
	return new Response(image, {
		headers: {
			'Content-Type': 'image/jpeg'
		}
	});
};

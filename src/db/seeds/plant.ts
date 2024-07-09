import { faker } from '@faker-js/faker';
import type { db } from 'src/db';
import { plant, room, house, plantImage } from '../schema';
import { eq } from 'drizzle-orm';
import { getImageBuffer } from 'src/lib/utils/images';
// import plant1 from '$lib/assets/images/plant1.jpg';
// import plant2 from '$lib/assets/images/plant2.jpg';
// console.log('plant1', plant1);
// console.log('plant2', plant2);

export default async function seed(db: db) {
	const houseResult = await db
		.select({ houseId: house.id })
		.from(house)
		.where(eq(house.name, 'Pants'))
		.limit(1);
	const { houseId } = houseResult[0];
	const roomResult = await db
		.select({ roomId: room.id })
		.from(room)
		.where(eq(room.house_id, houseId))
		.limit(1);
	const { roomId } = roomResult[0];

	for (let i = 0; i < 10; i++) {
		const [result] = await db
			.insert(plant)
			.values({
				name: faker.person.firstName(),
				species: 'Prosopsis spp.',
				house_id: houseId,
				room_id: roomId,
				has_image: true
			})
			.returning();

		const insertedId = result.id;

		if (insertedId) {
			await db.insert(plantImage).values({
				plant_id: insertedId,
				data: await getImageBuffer('src/lib/assets/images/plant1.jpg')
			});
		}
	}
}

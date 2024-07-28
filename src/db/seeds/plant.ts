import { faker } from '@faker-js/faker';
import type { db } from 'src/db';
import { plant, room, house } from '../schema';
import { eq } from 'drizzle-orm';

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

	for (let i = 0; i < 4; i++) {
		await db.insert(plant).values({
			name: faker.person.firstName(),
			species: 'Prosopsis spp.',
			house_id: houseId,
			room_id: roomId,
			water_schedule: i + 4,
			notes: faker.lorem.paragraphs(3)
		});
	}
}

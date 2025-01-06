import { faker } from '@faker-js/faker';
import type { db } from 'src/db';
import { plant, watering_event, user } from '../schema';
import { wait } from 'src/lib/utils/wait';

export default async function seed(db: db) {
	const plantResults = await db.select().from(plant);
	const users = await db.select().from(user).limit(1);
	const user_id = users[0].id;

	for (const plant of plantResults) {
		await db.insert(watering_event).values({
			notes: faker.lorem.sentence(),
			plant_id: plant.id,
			user_id: user_id,
			watered: true,
			timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).getTime()
		});
		await wait(100);
		await db.insert(watering_event).values({
			notes: faker.lorem.sentence(),
			plant_id: plant.id,
			user_id: user_id,
			watered: true,
			timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).getTime()
		});
	}
}

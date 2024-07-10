import { eq } from 'drizzle-orm';
import type { db as DbType } from '..';
import { house, user } from '../schema';

export default async function seed(db: DbType) {
	const houseResult = await db
		.select({ houseId: house.id })
		.from(house)
		.where(eq(house.name, 'Pants'))
		.limit(1);
	const { houseId } = houseResult[0];
	await db.insert(user).values({
		name: 'Parker',
		avatar_url: 'https://happyplants.parker.town/parker-avatar.png',
		default_house_id: houseId
	});
	await db.insert(user).values({
		name: 'Nell',
		avatar_url: 'https://happyplants.parker.town/nellavatar.png',
		default_house_id: houseId
	});
}

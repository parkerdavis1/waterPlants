import type { db } from '..';
import { house } from '../schema';

export default async function seed(db: db) {
	await db.insert(house).values({ name: 'Pants' });
}

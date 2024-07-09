import db, { client } from 'src/db';
import { plant } from 'src/db/schema';

export async function load() {
	const plants = await db.select().from(plant);
	return { plants };
}

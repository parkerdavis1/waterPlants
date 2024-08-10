import { eq } from 'drizzle-orm'
import type { db as DbType } from '..'
import { house, room } from '../schema'

export default async function seed(db: DbType) {
	const houseResult = await db
		.select({ houseId: house.id })
		.from(house)
		.where(eq(house.name, 'Pants'))
		.limit(1)
	const { houseId } = houseResult[0]
	await db.insert(room).values([
		{
			name: 'Inside',
			house_id: houseId,
		},
		{
			name: 'Outside',
			house_id: houseId,
		},
	])
}

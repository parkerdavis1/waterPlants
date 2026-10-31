import { eq } from 'drizzle-orm'
import type { db as DbType } from '..'
import { hash } from '@node-rs/argon2'
import { house, user } from '../schema'
import { argon2Options, seedPassword } from '../seedPassword'

const seededUsers = [
	{ name: 'Parker', avatar_url: 'https://happyplants.parker.town/parker-avatar.png' },
	{ name: 'Nell', avatar_url: 'https://happyplants.parker.town/nellavatar.png' },
]

export default async function seed(db: DbType) {
	const houseResult = await db
		.select({ houseId: house.id })
		.from(house)
		.where(eq(house.name, 'Pants'))
		.limit(1)
	const { houseId } = houseResult[0]
	const passwordHash = await hash(seedPassword(), argon2Options)

	for (const { name, avatar_url } of seededUsers) {
		const existing = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.name, name))
			.limit(1)

		if (existing.length > 0) {
			await db
				.update(user)
				.set({ passwordHash, avatar_url, default_house_id: houseId })
				.where(eq(user.id, existing[0].id))
		} else {
			await db.insert(user).values({ name, passwordHash, avatar_url, default_house_id: houseId })
		}
	}
}

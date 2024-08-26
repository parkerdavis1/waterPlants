import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { type InferSelectModel } from 'drizzle-orm'

export const plant = sqliteTable('plant', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	species: text('species').notNull(),
	name: text('name'),
	water_schedule: integer('water_schedule').default(7).notNull(),
	notes: text('notes'),
	image_url: text('image_url'),
	house_id: integer('house_id')
		.notNull()
		.references(() => house.id),
	room_id: integer('room_id')
		.references(() => room.id)
		.notNull(),
	created_at: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
})

export const watering_event = sqliteTable('watering_event', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	notes: text('notes'),
	watered: integer('watered', { mode: 'boolean' }),
	fertilized: integer('fertilized', { mode: 'boolean' }),
	image_url: text('image_url'),
	plant_id: integer('plant_id')
		.references(() => plant.id, { onDelete: 'cascade' })
		.notNull(),
	user_id: integer('user_id')
		.references(() => user.id)
		.notNull(),
	timestamp: integer('timestamp', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
})

export const house = sqliteTable('house', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	name: text('name').notNull(),
})

export const room = sqliteTable('room', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	house_id: integer('house_id').references(() => house.id),
	name: text('name').notNull(),
})

export const user = sqliteTable('user', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	avatar_url: text('avatar_url'),
	created_at: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	default_house_id: integer('default_house_id').references(() => house.id),
})

export const user_to_house = sqliteTable(
	'user_to_house',
	{
		user_id: integer('user_id'),
		house_id: integer('house_id'),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.user_id, table.house_id] }),
		}
	},
)

export type SelectUser = InferSelectModel<typeof user>
export type SelectRoom = InferSelectModel<typeof room>
export type SelectHouse = InferSelectModel<typeof house>
export type SelectWateringEvent = InferSelectModel<typeof watering_event>
export type SelectPlant = InferSelectModel<typeof plant>

export type PlantWateringEventJoin = {
	plant: SelectPlant
	watering_event: SelectWateringEvent
}

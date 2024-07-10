import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const plant = sqliteTable('plant', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	species: text('species'),
	water_period: integer('water_period').default(7),
	image_url: text('image_url'),
	house_id: integer('house_id')
		.notNull()
		.references(() => house.id),
	room_id: integer('room_id').references(() => room.id),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});

export const watering_events = sqliteTable('watering_events', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	comments: text('comments'),
	fertilized: integer('id', { mode: 'boolean' }),
	image_url: text('image_url'),
	plant_id: integer('plant_id').references(() => plant.id),
	timestamp: text('timestamp')
		.notNull()
		.default(sql`(current_timestamp)`)
});

export const house = sqliteTable('house', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	name: text('name').notNull()
});

export const room = sqliteTable('room', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	house_id: integer('house_id').references(() => house.id),
	name: text('name').notNull()
});

export const user = sqliteTable('user', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	avatar_url: text('avatar_url'),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	default_house_id: integer('default_house_id').references(() => house.id)
});

export const user_to_house = sqliteTable(
	'user_to_house',
	{
		user_id: integer('user_id'),
		house_id: integer('house_id')
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.user_id, table.house_id] })
		};
	}
);

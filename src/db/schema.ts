import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { type InferSelectModel } from 'drizzle-orm';

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

export const watering_event = sqliteTable('watering_event', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	comments: text('comments'),
	fertilized: integer('fertilized', { mode: 'boolean' }).default(false),
	image_url: text('image_url'),
	plant_id: integer('plant_id')
		.references(() => plant.id)
		.notNull(),
	user_id: integer('user_id')
		.references(() => user.id)
		.notNull(),
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

export type SelectUser = InferSelectModel<typeof user>;
export type SelectRoom = InferSelectModel<typeof room>;
export type SelectHouse = InferSelectModel<typeof house>;
export type SelectWateringEvent = InferSelectModel<typeof watering_event>;
export type SelectPlant = InferSelectModel<typeof plant>;

export type PlantWateringEventJoin = {
	plant: SelectPlant;
	watering_event: SelectWateringEvent;
};

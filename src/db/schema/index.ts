import { sql } from 'drizzle-orm';
import { sqliteTable, text, blob } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';

export const plant = sqliteTable('plant', {
	id: text('id').primaryKey().default(ulid()),
	name: text('name').notNull(),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	photo: blob('photo', { mode: 'buffer' }),
	house_id: text('house_id')
		.notNull()
		.references(() => house.id),
	room_id: text('room_id').references(() => room.id)
});

export const house = sqliteTable('house', {
	id: text('id').primaryKey().default(ulid()),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	name: text('name').notNull()
});

export const room = sqliteTable('room', {
	id: text('id').primaryKey().default(ulid()),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	house_id: text('house_id').references(() => house.id),
	name: text('name').notNull()
});

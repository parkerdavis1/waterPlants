import { type Table } from 'drizzle-orm'
import type { db as DbType } from '.'
import db from '.'
import * as schema from 'src/db/schema'
import * as seeds from 'src/db/seeds'

// console.log('\ndoes it exist\n', await db.select().from(schema.house));

async function resetTable(db: DbType, table: Table) {
	await db.delete(table)
}

for (const table of [schema.plant, schema.room, schema.house]) {
	await resetTable(db, table)
}

await seeds.house(db)
await seeds.room(db)
await seeds.plant(db)
await seeds.user(db)
await seeds.watering_event(db)

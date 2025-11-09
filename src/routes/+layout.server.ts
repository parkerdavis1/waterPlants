import db from 'src/db'
import type { LayoutServerLoad } from './$types'
import { plant, room, user, watering_event } from 'src/db/schema'
import { and, desc, eq, or, gt } from 'drizzle-orm'
import { DAY_MILLISECONDS } from 'src/lib/utils/constants'
import type { PlantObj } from 'src/lib/types/plantObj'

export const ssr = false

export const load: LayoutServerLoad = async ({ locals }) => {
	console.log('\nRerunning server load...\n', new Date().toLocaleTimeString())
	if (locals.user) {
		return {
			user: locals.user,
			rooms: await db.select().from(room).where(eq(room.active, true)).orderBy(room.name),
			users: await db.select().from(user),
			loggedIn: true,
			plantsWater: await getDueDatePlantsWater(),
		}
	} else {
		return {
			loggedIn: false,
		}
	}
}

async function getDueDatePlantsWater() {
	const plantsWater = await db
		.select()
		.from(plant)
		.leftJoin(
			watering_event,
			and(
				eq(plant.id, watering_event.plant_id),
				eq(
					watering_event.id,
					db
						.select({ id: watering_event.id })
						.from(watering_event)
						.where(
							and(
								or(eq(watering_event.watered, true), gt(watering_event.waitUntil, 0)),
								eq(watering_event.plant_id, plant.id),
							),
						)
						.orderBy(desc(watering_event.timestamp))
						.limit(1),
				),
			),
		)

	const dueDatePlantsWater = plantsWater
		.map((obj) => ({
			...obj,
			plant: {
				...obj.plant,
				dueDate: getDueDate(obj),
			},
		}))
		.sort((a, b) => a.plant.dueDate - b.plant.dueDate)

	return dueDatePlantsWater
}

// function getDueDate(eventTime: number | undefined, days: number) {
// 	if (!eventTime) return new Date().getTime()
// 	const unixPeriod = days * 1000 * 60 * 60 * 24
// 	return eventTime + unixPeriod
// }

function getDueDate(plantObj: PlantObj) {
	if (plantObj.watering_event?.waitUntil) {
		return plantObj.watering_event.waitUntil
	} else {
		const eventTime = plantObj.watering_event?.timestamp
		if (!eventTime) {
			return 0
		}
		const dueDate = eventTime + plantObj.plant.water_schedule * DAY_MILLISECONDS
		return dueDate
	}
}

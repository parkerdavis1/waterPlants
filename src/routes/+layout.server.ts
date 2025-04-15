import db from "src/db";
import type { LayoutServerLoad } from "./$types";
import { plant, room, user, watering_event } from "src/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export const ssr = false;

export const load: LayoutServerLoad = async ({ locals }) => {
	console.log("\n\n\nRERUNNING LAYOUT SERVER LOAD\n\n\n");
	if (locals.user) {
		return {
			user: locals.user,
			rooms: await db.select().from(room).where(eq(room.active, true))
				.orderBy(room.name),
			users: await db.select().from(user),
			loggedIn: true,
			plantsWater: await getDueDatePlantsWater(),
		};
	} else {
		return {
			loggedIn: false,
		};
	}
};

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
								eq(watering_event.watered, true),
								eq(watering_event.plant_id, plant.id),
							),
						)
						.orderBy(desc(watering_event.timestamp))
						.limit(1),
				),
			),
		);

	const dueDatePlantsWater = plantsWater
		.map((obj) => ({
			...obj,
			plant: {
				...obj.plant,
				dueDate: getDueDate(
					obj.watering_event?.timestamp,
					obj.plant.water_schedule,
				),
			},
		}))
		.sort((a, b) => a.plant.dueDate - b.plant.dueDate);

	return dueDatePlantsWater;
}

function getDueDate(eventTime: number | undefined, period: number) {
	if (!eventTime) return new Date().getTime();
	const unixPeriod = period * 1000 * 60 * 60 * 24;
	return eventTime + unixPeriod;
}

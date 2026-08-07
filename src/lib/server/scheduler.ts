import cron from 'node-cron'
import { and, desc, eq, gt, or } from 'drizzle-orm'
import db from 'src/db'
import { plant, room, watering_event, type SelectPlant, type SelectRoom, type SelectWateringEvent } from 'src/db/schema'
import { DAY_MILLISECONDS } from 'src/lib/utils/constants'
import { sendPushToAllUsers } from './push'

const CRON_EXPRESSION = '0 8,9,10,11,12,13,14,15,16,17,18,19,20 * * *'
const CRON_TIMEZONE = 'America/Phoenix'

type DuePlant = {
	plantId: number
	name: string | null
	species: string
	roomName: string | null
	wateringEventId: number
}

function getDueDate(wateringEvent: { waitUntil: number | null; timestamp: number } | undefined, waterSchedule: number) {
	if (!wateringEvent) return 0
	if (wateringEvent.waitUntil) return wateringEvent.waitUntil
	return wateringEvent.timestamp + waterSchedule * DAY_MILLISECONDS
}

async function getOverdueUnnotifiedPlants(): Promise<DuePlant[]> {
	const rows = await db
		.select()
		.from(plant)
		.leftJoin(room, eq(plant.room_id, room.id))
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
		.where(eq(plant.alive, true))

	const typedRows = rows as unknown as {
		plant: SelectPlant
		room: SelectRoom | null
		watering_event: SelectWateringEvent | null
	}[]

	const now = Date.now()

	const due: DuePlant[] = []
	for (const row of typedRows) {
		if (!row.watering_event) continue // never watered, no baseline to compute from yet
		if (row.watering_event.notified_at) continue // already notified for this cycle
		const dueDate = getDueDate(row.watering_event, row.plant.water_schedule)
		if (dueDate && dueDate <= now) {
			due.push({
				plantId: row.plant.id,
				name: row.plant.name,
				species: row.plant.species,
				roomName: row.room?.name ?? null,
				wateringEventId: row.watering_event.id,
			})
		}
	}

	return due
}

function buildNotificationPayload(duePlants: DuePlant[]) {
	if (duePlants.length === 1) {
		const [singlePlant] = duePlants
		const plantName = singlePlant.name || singlePlant.species
		const body = singlePlant.roomName
			? `${plantName} (${singlePlant.roomName}) needs watering`
			: `${plantName} needs watering`
		return { title: 'Watering Reminder', body, url: `/${singlePlant.plantId}` }
	}

	return {
		title: 'Watering Reminder',
		body: `${duePlants.length} plants need watering`,
		url: '/',
	}
}

export async function checkAndSendWateringNotifications() {
	const duePlants = await getOverdueUnnotifiedPlants()
	if (duePlants.length === 0) return 0

	const payload = buildNotificationPayload(duePlants)
	await sendPushToAllUsers(payload)

	for (const duePlant of duePlants) {
		await db
			.update(watering_event)
			.set({ notified_at: Date.now() })
			.where(eq(watering_event.id, duePlant.wateringEventId))
	}

	return duePlants.length
}

let started = false

export function startScheduler() {
	if (started) return
	started = true

	cron.schedule(CRON_EXPRESSION, () => {
		checkAndSendWateringNotifications().catch((error) => {
			console.error('\nWatering notification scheduler error: ', error)
		})
	}, { timezone: CRON_TIMEZONE })

	console.log(`\nWatering notification scheduler started (${CRON_EXPRESSION} ${CRON_TIMEZONE})`)
}

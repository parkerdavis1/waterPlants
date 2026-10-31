import { DAY_MILLISECONDS } from './constants'

type WateringEventLike = { waitUntil?: number | null; timestamp?: number | null } | null | undefined
type PlantLike = { water_schedule: number }

export function getProgressPercent(lastWateringEvent: WateringEventLike, plantData: PlantLike) {
	if (lastWateringEvent?.waitUntil) {
		const milliseconds = lastWateringEvent.waitUntil - new Date().getTime()
		const percent =
			milliseconds > plantData.water_schedule * DAY_MILLISECONDS
				? 100
				: (milliseconds / (plantData.water_schedule * DAY_MILLISECONDS)) * 100
		return percent
	} else {
		const timestamp = lastWateringEvent?.timestamp
		const milliseconds = timestamp ? new Date().getTime() - new Date(timestamp).getTime() : 0
		const percent = timestamp
			? 100 - (milliseconds / (plantData.water_schedule * DAY_MILLISECONDS)) * 100
			: 0
		return percent
	}
}

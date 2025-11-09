import { DAY_MILLISECONDS } from './constants'

export function getProgressPercent(lastWateringEvent, plantData) {
	if (lastWateringEvent?.waitUntil) {
		const milliseconds = lastWateringEvent.waitUntil - new Date().getTime()
		const percent =
			milliseconds > plantData.water_schedule * DAY_MILLISECONDS
				? 100
				: (milliseconds / (plantData.water_schedule * DAY_MILLISECONDS)) * 100
		return percent
	} else {
		const milliseconds = new Date().getTime() - new Date(lastWateringEvent?.timestamp).getTime()
		const percent = lastWateringEvent?.timestamp
			? 100 - (milliseconds / (plantData.water_schedule * DAY_MILLISECONDS)) * 100
			: 0
		return percent
	}
}

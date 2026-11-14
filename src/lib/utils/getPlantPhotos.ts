import type { SelectWateringEvent } from '#src/db/schema.js'

export type PlantPhoto = {
	id: number
	url: string
	timestamp: number
	notes: string | null
}

export function getPlantPhotos(events: SelectWateringEvent[]): PlantPhoto[] {
	return [...events]
		.filter((event) => Boolean(event.image_url))
		.sort((a, b) => b.timestamp - a.timestamp || b.id - a.id)
		.map((event) => ({
			id: event.id,
			url: event.image_url as string,
			timestamp: event.timestamp,
			notes: event.notes ?? null,
		}))
}

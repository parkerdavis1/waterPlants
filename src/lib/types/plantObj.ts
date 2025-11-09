export interface PlantObj {
	plant: Plant
	watering_event: WateringEvent
}

export interface Plant {
	id: number
	species: string
	name: string
	water_schedule: number
	notes: string
	image_url: string
	house_id: number
	room_id: number
	alive: number
	created_at: number
}

export interface WateringEvent {
	id: number
	notes: string
	watered: boolean
	fertilized: boolean
	waitUntil: number
	image_url: string
	plant_id: number
	user_id: number
	timestamp: number
}

import type { SelectPlant, SelectWateringEvent } from '../../db/schema'

export interface PlantObj {
	plant: SelectPlant
	watering_event: SelectWateringEvent | null
}

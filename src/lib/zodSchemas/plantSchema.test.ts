import { describe, expect, it } from 'vitest'
import { editPlantSchema } from './plantSchema'

const base = {
	id: 1,
	species: 'Fern',
	name: '',
	notes: '',
	room_id: 1,
	house_id: 1,
	water_schedule: 7,
}

describe('editPlantSchema alive', () => {
	it('treats the checked switch value "on" as alive', () => {
		expect(editPlantSchema.parse({ ...base, alive: 'on' }).alive).toBe(true)
	})

	it('treats an omitted field (unchecked switch) as not alive', () => {
		expect(editPlantSchema.parse(base).alive).toBe(false)
	})

	it('treats the string "false" as not alive', () => {
		expect(editPlantSchema.parse({ ...base, alive: 'false' }).alive).toBe(false)
	})

	it('passes through boolean values from the database', () => {
		expect(editPlantSchema.parse({ ...base, alive: true }).alive).toBe(true)
		expect(editPlantSchema.parse({ ...base, alive: false }).alive).toBe(false)
	})
})

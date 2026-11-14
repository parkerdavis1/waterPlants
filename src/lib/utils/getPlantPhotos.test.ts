import { describe, expect, it } from 'vitest'
import type { SelectWateringEvent } from '#src/db/schema.js'
import { getPlantPhotos } from '#src/lib/utils/getPlantPhotos.js'

function event(overrides: Partial<SelectWateringEvent> = {}): SelectWateringEvent {
	return {
		id: 1,
		notes: null,
		watered: true,
		fertilized: false,
		waitUntil: null,
		image_url: null,
		notified_at: null,
		plant_id: 1,
		user_id: 1,
		timestamp: 1000,
		...overrides,
	}
}

describe('getPlantPhotos', () => {
	it('filters out events without a non-empty image_url', () => {
		const photos = getPlantPhotos([
			event({ id: 1, image_url: null }),
			event({ id: 2, image_url: undefined as unknown as null }),
			event({ id: 3, image_url: '' }),
			event({ id: 4, image_url: 'https://example.com/a.jpg' }),
		])

		expect(photos).toHaveLength(1)
		expect(photos[0].id).toBe(4)
	})

	it('sorts newest first by timestamp', () => {
		const photos = getPlantPhotos([
			event({ id: 1, image_url: 'a.jpg', timestamp: 100 }),
			event({ id: 2, image_url: 'b.jpg', timestamp: 300 }),
			event({ id: 3, image_url: 'c.jpg', timestamp: 200 }),
		])

		expect(photos.map((photo) => photo.id)).toEqual([2, 3, 1])
	})

	it('tie-breaks equal timestamps by id descending', () => {
		const photos = getPlantPhotos([
			event({ id: 10, image_url: 'a.jpg', timestamp: 500 }),
			event({ id: 12, image_url: 'b.jpg', timestamp: 500 }),
			event({ id: 11, image_url: 'c.jpg', timestamp: 500 }),
		])

		expect(photos.map((photo) => photo.id)).toEqual([12, 11, 10])
	})

	it('maps id, url, timestamp, and notes', () => {
		const photos = getPlantPhotos([
			event({
				id: 7,
				image_url: 'https://example.com/plant.jpg',
				timestamp: 12345,
				notes: 'New leaf',
			}),
			event({
				id: 8,
				image_url: 'https://example.com/plant-2.jpg',
				timestamp: 6789,
				notes: null,
			}),
		])

		expect(photos).toEqual([
			{
				id: 7,
				url: 'https://example.com/plant.jpg',
				timestamp: 12345,
				notes: 'New leaf',
			},
			{
				id: 8,
				url: 'https://example.com/plant-2.jpg',
				timestamp: 6789,
				notes: null,
			},
		])
	})

	it('does not mutate the input array', () => {
		const events = [
			event({ id: 1, image_url: 'a.jpg', timestamp: 100 }),
			event({ id: 2, image_url: 'b.jpg', timestamp: 200 }),
		]
		const originalOrder = events.map((item) => item.id)

		getPlantPhotos(events)

		expect(events.map((item) => item.id)).toEqual(originalOrder)
	})

	it('returns an empty array for an empty input', () => {
		expect(getPlantPhotos([])).toEqual([])
	})
})

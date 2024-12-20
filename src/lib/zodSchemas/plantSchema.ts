import { z } from 'zod'
import { imageSchema } from './images'

export const waterPlantSchema = z.object({
	species: z.string(),
	name: z.string().optional(),
	notes: z.string().optional(),
	image: imageSchema,
	room_id: z.number(),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7),
})

export const plantEventSchema = z.object({
	notes: z.string().optional(),
	fertilized: z.boolean(),
	watered: z.boolean().default(true),
	wait: z.number().optional(),
	plant_id: z.number(),
	user_id: z.number(),
	image: imageSchema,
}) // write some meta zod logic where it can't be wait and water/fertilized at the same time
.transform((data) => {
	if (data.wait) {
		return {
			...data,
			watered: false,
			fertilized: false,
		}
	} else {
		return data
	}
})


export const editPlantSchema = z.object({
	id: z.number(),
	species: z.string(),
	name: z.string().optional(),
	notes: z.string().optional(),
	image: imageSchema,
	room_id: z.number(),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7),
	oldImageUrl: z.string().url().optional(),
})

export const deleteEventSchema = z.object({
	id: z.string(),
	plantId: z.string(),
})

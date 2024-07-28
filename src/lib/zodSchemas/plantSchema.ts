import { z } from 'zod';
import { imageSchema } from './images';

export const waterPlantSchema = z.object({
	species: z.string(),
	name: z.string().optional(),
	notes: z.string().optional(),
	image: imageSchema,
	room_id: z.number(),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7)
});

export const plantEventSchema = z.object({
	notes: z.string().optional(),
	fertilized: z.boolean(),
	plant_id: z.number(),
	user_id: z.number(),
	image: imageSchema
});

export const editPlantSchema = z.object({
	id: z.number(),
	species: z.string(),
	name: z.string().optional(),
	notes: z.string(),
	image: imageSchema,
	room_id: z.number(),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7),
	oldImageUrl: z.string().url()
});

import { z } from 'zod';
import { imageSchema } from './images';

export const newPlantSchema = z.object({
	name: z.string(),
	species: z.string().optional(),
	image: imageSchema,
	room_id: z.number(),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7)
});

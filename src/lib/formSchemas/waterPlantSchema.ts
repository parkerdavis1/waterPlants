import { z } from 'zod';
import { imageSchema } from './images';

export const waterPlantSchema = z.object({
	comments: z.string().optional(),
	fertilized: z.boolean(),
	plant_id: z.number(),
	user_id: z.number(),
	image: imageSchema
});

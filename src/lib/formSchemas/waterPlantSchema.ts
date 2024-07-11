import { z } from 'zod';

export const waterPlantSchema = z.object({
	comments: z.string().optional(),
	fertilized: z.boolean(),
	plant_id: z.number(),
	user_id: z.number(),
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 1_000_000, 'Max 1 MB upload size')
		.optional()
});

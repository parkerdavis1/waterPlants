import { z } from 'zod';

export const imageSchema = z.object({
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 1_000_000, 'Max 1 MB upload size')
});

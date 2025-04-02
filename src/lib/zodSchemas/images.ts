import { z } from 'zod';

export const imageSchema = z
	.instanceof(File, { message: 'Please upload a file.' })
	.refine((f) => f.size < 2_000_000, 'Max 2 MB upload size')
	.optional();

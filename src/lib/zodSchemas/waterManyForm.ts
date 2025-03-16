import { z } from 'zod'

export const multiWateringFormSchema = z.object({
	userId: z.coerce.number(),
	plantIds: z.array(z.number()),
	notes: z.string().optional(),
})

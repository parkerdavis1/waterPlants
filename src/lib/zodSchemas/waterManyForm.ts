import { z } from 'zod'

export const wateringFormSchema = z.object({
	plantIds: z.array(z.number()),
})

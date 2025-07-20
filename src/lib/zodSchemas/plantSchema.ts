import { z } from "zod";
import { imageSchema } from "./images";

export const newPlantSchema = z.object({
	species: z.string(),
	name: z.string().optional(),
	notes: z.string().optional(),
	image: imageSchema,
	room_id: z.number().default(1),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7),
});

export const plantEventSchema = z.object({
	notes: z.string().optional(),
	fertilized: z.boolean(),
	watered: z.boolean().default(true),
	wait: z.number().optional(),
	plant_id: z.number(),
	user_id: z.number(),
	image: imageSchema,
	timestamp: z.number().optional(),
}).transform((data) => {
	if (data.wait) {
		return {
			...data,
			watered: false,
			fertilized: false,
			timestamp: undefined,
		};
	} else {
		return data;
	}
});

export const editPlantSchema = z.object({
	id: z.number(),
	species: z.string(),
	name: z.string().default(""),
	notes: z.string().default(""),
	image: imageSchema,
	room_id: z.number(),
	house_id: z.number().default(1),
	water_schedule: z.number().positive().min(1).default(7),
	oldImageUrl: z.string().url().optional(),
	alive: z.coerce.boolean().default(true),
});

export const deleteEventSchema = z.object({
	id: z.string(),
	plantId: z.string(),
});

export const deletePlantSchema = z.object({
	id: z.string(),
	image_url: z.string().url().optional(),
});

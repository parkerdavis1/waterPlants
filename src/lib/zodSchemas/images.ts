import { z } from "zod";

export const imageSchema = z
	.instanceof(File, { message: "Please upload a file." })
	.refine((f) => f.size < 5_000_000, "Max 5 MB upload size")
	.optional();

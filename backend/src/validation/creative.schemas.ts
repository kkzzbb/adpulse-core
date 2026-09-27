import { z } from "zod";
import type { CreateCreativeInput } from "../domain/creative.js";

export const createCreativeSchema:
	z.ZodType<CreateCreativeInput> =
	z.object({
		headline: z.string().trim().min(1, "Creative headline is required"),
		body: z.string().trim().min(1, "Creative body is required"),
		destinationUrl: z.url("Destination URL must be valid")
	}).strict();
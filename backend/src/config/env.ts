import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	PORT: z.coerce.number().int().positive().default(3000),

	DEFAULT_USER_ID: z.uuid(),
});

export const env = envSchema.parse(process.env);
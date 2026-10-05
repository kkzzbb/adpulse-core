import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().trim().email("Email must be valid")
		.transform((email) => email.toLowerCase()),

	displayName: z.string().trim().min(1, "Display name is required")
		.max(100, "Display name is too long	"),

	password: z.string().min(15, "Password must be at least 15 characters")
		.max(128, "Password is too long"),
});

export const loginSchema = z.object({
	email: z.string().trim().email("Email must be valid")
		.transform((email) => email.toLowerCase()),

	password: z.string().min(1, "Password is required")
		.max(128, "Password is too long"),
});
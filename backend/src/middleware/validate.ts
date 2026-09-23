import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../errors/app-error.js";

export function validateBody(schema: ZodTypeAny): RequestHandler {
	return (req, _res, next) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			return next(
				new AppError(
					"Invalid request body",
					400,
					result.error.issues,
				),
			);
		}
		req.body = result.data;
		next();
	};
}
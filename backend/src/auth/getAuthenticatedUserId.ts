import type { Request } from "express";

export function getAuthenticatedUserId(req: Request): string {
	if (!req.auth) {
		throw new Error("Authenticated request context is missing");
	}
	return req.auth.userId;
}
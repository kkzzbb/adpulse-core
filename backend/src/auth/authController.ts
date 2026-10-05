import type { Response, Request, NextFunction } from "express";
import type { AuthService } from "./authService.js";
import { InvalidCredentialsError, RegistrationConflictError } from "./authErrors.js";
import { regenerateSession, saveSession, destroySession } from "./sessionHelpers.js";
import { getAuthenticatedUserId } from "./getAuthenticatedUserId.js";

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	register = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await this.authService.register(req.body);
			
			await regenerateSession(req);
			req.session.userId = user.id;
			
			await saveSession(req);
			res.status(201).json({ user });
		} catch (error) {
			if (error instanceof RegistrationConflictError) {
				res.status(409).json({ error: error.message });
				return;
			}

			next(error);
		}
	};

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await this.authService.login(req.body);

			await regenerateSession(req);
			req.session.userId = user.id;

			await saveSession(req);
			res.status(200).json({ user });
		} catch (error) {
			if (error instanceof InvalidCredentialsError) {
				res.status(401).json({ error: "Invalid email or password" });
				return;
			}

			next(error);
		}
	};

	logout = async (req: Request, res: Response, next: NextFunction) => {
		try {
			await destroySession(req);
			res.clearCookie("adpulse.sid", { path: "/" });
			res.status(204).send();
		} catch (error) {
			next(error);
		}
	};

	me = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const user = await this.authService.getCurrentUser(userId);

			if (!user) {
				await destroySession(req);
				res.clearCookie("adpulse.sid", { path: "/" });
				res.status(401).json({ error: "Authentication required" });
				return;
			}
			res.status(200).json({ user });
		} catch (error) {
			next(error);
		}
	};
}	
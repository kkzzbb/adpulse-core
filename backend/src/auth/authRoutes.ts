import { Router } from "express";
import type  { AuthController } from "./authController.js";
import { loginSchema, registerSchema } from "./authSchemas.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "./requireAuth.js";

export function createAuthRouter(authController: AuthController) {
	const router = Router();

	router.post("/register", validateBody(registerSchema), authController.register);
	router.post("/login", validateBody(loginSchema), authController.login);
	router.get("/me", requireAuth, authController.me);
	router.post("/logout", authController.logout);

	return router;
}
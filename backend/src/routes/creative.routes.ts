import { Router } from "express";
import type { CreativeController } from "../controllers/creative.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createCreativeSchema } from "../validation/creative.schemas.js";

export function createCreativeRouter(creativeController: CreativeController) {
	const router = Router({mergeParams: true});

	router.get("/", creativeController.getCampaignCreatives);

	router.post("/", validateBody(createCreativeSchema), creativeController.createCreative);

	return router;
}
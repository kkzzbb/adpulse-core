import { Router } from "express";
import type { CampaignController } from "../controllers/campaign.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createCampaignSchema } from "../validation/campaign.schemas.js";

export function createCampaignRouter(campaignController: CampaignController) {
	const router = Router();

	router.get("/", campaignController.getCampaigns);

	router.get("/:id", campaignController.getCampaignById);

	router.post("/", validateBody(createCampaignSchema), campaignController.createCampaign);

	return router;
}
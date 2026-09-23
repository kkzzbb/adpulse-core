import { Router } from "express";
import type { CampaignController } from "../controllers/campaign.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createCampaignSchema,  updateCampaignStatusSchema } from "../validation/campaign.schemas.js";

export function createCampaignRouter(campaignController: CampaignController) {
	const router = Router();

	router.get("/", campaignController.getCampaigns);

	router.get("/:id", campaignController.getCampaignById);

	router.post("/", validateBody(createCampaignSchema), campaignController.createCampaign);

	router.patch("/:id/status", validateBody(updateCampaignStatusSchema),
		campaignController.updateCampaignStatus);
		
	return router;
}
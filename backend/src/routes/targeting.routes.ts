import { Router } from "express";
import type { TargetingController } from "../controllers/targeting.controller.js";
import { validateBody } from "../middleware/validate.js";
import { updateCampaignTargetingSchema } from "../validation/campaign.schemas.js";

export function createTargetingRouter(
  targetingController: TargetingController
) {
  const router = Router({mergeParams: true});

  router.get("/", targetingController.getCampaignTargeting);

  router.put("/", validateBody(updateCampaignTargetingSchema),
    targetingController.updateCampaignTargeting);

  return router;
}
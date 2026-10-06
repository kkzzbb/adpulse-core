import type { Response, Request, NextFunction } from "express";
import { getAuthenticatedUserId } from "../auth/getAuthenticatedUserId.js";
import type { UpdateCampaignTargetingInput } from "../domain/targeting.js";
import type { TargetingService } from "../services/targeting.service.js";

export class TargetingController {
  constructor(
    private readonly targetingService: TargetingService
  ) {}

  getCampaignTargeting = async (
      req: Request<{campaignId: string;}>,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const userId = getAuthenticatedUserId(req);
        const targeting = await this.targetingService.getCampaignTargeting(
          userId, req.params.campaignId);

				return res.json(targeting);
      } catch (error) {
        next(error);
      }
    };

  updateCampaignTargeting = async (
      req: Request<{campaignId: string;}, unknown, UpdateCampaignTargetingInput>,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const userId = getAuthenticatedUserId(req);

        const targeting = await this.targetingService.updateCampaignTargeting(
          userId, req.params.campaignId, req.body);

        return res.json(targeting);
      } catch (error) {
        next(error);
      }
    };
}
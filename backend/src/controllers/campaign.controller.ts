import type { NextFunction, Request, Response, } from "express";
import type { CampaignService } from "../services/campaign.service.js";
import type { CreateCampaignInput } from "../domain/campaign.js";

export class CampaignController {
	constructor(
		private readonly campaignService: CampaignService,
	) {}

	getCampaigns = async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const campaigns = await this.campaignService.getCampaigns();

			return res.json(campaigns);
		} catch (error) {
			next(error);
		}
	};
	
	getCampaignById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const campaign = await this.campaignService.getCampaignById(req.params.id);
			
			return res.json(campaign);
		} catch (error) {
			next(error);
		}
	};

	createCampaign = async (
		req: Request<Record<string, never>, unknown, CreateCampaignInput>,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const campaign = await this.campaignService.createCampaign(req.body);
			
			return res.status(201).json(campaign);
		} catch (error) {
			next(error);
		}
	};
}
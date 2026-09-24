import type { NextFunction, Request, Response, } from "express";
import type { CampaignService } from "../services/campaign.service.js";
import type { CreateCampaignInput, UpdateCampaignStatusInput,
	UpdateCampaignBudgetInput
 } from "../domain/campaign.js";

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

	updateCampaignStatus = async (
		req: Request<{id: string}, unknown, UpdateCampaignStatusInput>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const campaign = await this.campaignService.updateCampaignStatus(
				req.params.id, req.body.status
			);
			
			return res.json(campaign);
		} catch (error) {
			next(error);
		}
	};

	updateCampaignBudget = async (
		req: Request<{id: string}, unknown, UpdateCampaignBudgetInput>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const campaign = await this.campaignService.updateCampaignBudget(
				req.params.id, req.body.budget
			);

			return res.json(campaign);
		} catch (error) {
			next(error);
		}
	};
}
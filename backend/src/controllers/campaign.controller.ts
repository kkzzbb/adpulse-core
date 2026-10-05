import type { NextFunction, Request, Response, } from "express";
import type { CampaignService } from "../services/campaign.service.js";
import type { CreateCampaignInput, UpdateCampaignStatusInput,
	UpdateCampaignBudgetInput, UpdateCampaignInput,
	CreateCampaignWithCreativeInput,
 } from "../domain/campaign.js";
import { getAuthenticatedUserId } from "../auth/getAuthenticatedUserId.js";

export class CampaignController {
	constructor(
		private readonly campaignService: CampaignService,
	) {}

	getCampaigns = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const campaigns = await this.campaignService.getCampaigns(userId);

			return res.json(campaigns);
		} catch (error) {
			next(error);
		}
	};
	
	getCampaignById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const campaign = await this.campaignService.getCampaignById(userId, req.params.id);
			
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
			const userId = getAuthenticatedUserId(req);
			const campaign = await this.campaignService.createCampaign(userId, req.body);
			
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
			const userId = getAuthenticatedUserId(req);
			const campaign = await this.campaignService.updateCampaignStatus(
				userId, req.params.id, req.body.status
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
			const userId = getAuthenticatedUserId(req);
			const campaign = await this.campaignService.updateCampaignBudget(
				userId, req.params.id, req.body.budget
			);

			return res.json(campaign);
		} catch (error) {
			next(error);
		}
	};

	updateCampaign = async (
		req: Request<{id: string}, unknown, UpdateCampaignInput>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const campaign = await this.campaignService.updateCampaign(
				userId, req.params.id, req.body
			);

			return res.json(campaign);
		} catch (error) {
			next(error);
		}
	};

	archiveCampaign = async (
		req: Request<{id: string}>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const userId = getAuthenticatedUserId(req);
			await this.campaignService.archiveCampaign(userId, req.params.id);

			return res.status(204).send();
		} catch (error) {
			next(error);
		}
	};

	createCampaignWithCreative = async (
		req: Request<Record<string, never>, unknown, CreateCampaignWithCreativeInput>,
		res: Response,		
		next: NextFunction
	) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const result = await this.campaignService.createCampaignWithCreative(userId, req.body);
			
			return res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	};
}
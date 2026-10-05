import type { Request, Response, NextFunction } from "express";
import type { CreateCreativeInput } from "../domain/creative.js";
import type { CreativeService } from "../services/creative.service.js";
import { getAuthenticatedUserId } from "../auth/getAuthenticatedUserId.js";

export class CreativeController {
	constructor(private readonly creativeService: CreativeService) {}

	getCampaignCreatives = async (
		req: Request<{campaignId: string;}>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const creatives = await this.creativeService.getCampaignCreatives(
				userId,
				req.params.campaignId
			);

			return res.json(creatives);
		} catch (error) {
			next(error);
		}
	};

	createCreative = async (
		req: Request<{campaignId: string}, unknown,	CreateCreativeInput>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const userId = getAuthenticatedUserId(req);
			const creative = await this.creativeService.createCreative(
				userId,
				req.params.campaignId,
				req.body
			);

			return res.status(201).json(creative);
		} catch (error) {
			next(error);
		}
	};
}
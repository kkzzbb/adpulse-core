import type { Request, Response, NextFunction } from "express";
import type { CreateCreativeInput } from "../domain/creative.js";
import type { CreativeService } from "../services/creative.service.js";

export class CreativeController {
	constructor(private readonly creativeService: CreativeService) {}

	getCampaignCreatives = async (
		req: Request<{campaignId: string;}>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const creatives = await this.creativeService.getCampaignCreatives(
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
			const creative = await this.creativeService.createCreative(
				req.params.campaignId,
				req.body
			);

			return res.status(201).json(creative);
		} catch (error) {
			next(error);
		}
	};
}
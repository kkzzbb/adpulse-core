import { randomUUID } from "node:crypto";
import type { CreateCreativeInput, Creative } from "../domain/creative.js";
import { AppError } from "../errors/app-error.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { CreativeRepository } from "../repositories/creative.repository.js";

export class CreativeService {
	constructor(
		private readonly campaignRepository: CampaignRepository,

		private readonly creativeRepository: CreativeRepository,
	) {}


	async getCampaignCreatives(userId: string, campaignId: string): Promise<Creative[]> {
		const campaign = await this.campaignRepository.findByIdForUser(userId, campaignId);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		return this.creativeRepository.findByCampaignId(campaignId);
	}

	async createCreative(userId: string, campaignId: string, input: CreateCreativeInput): Promise<Creative> {
		const campaign = await this.campaignRepository.findByIdForUser(userId, campaignId);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.status !== "DRAFT") {
			throw new AppError("Creative can only be added to draft campaigns", 409);
		}

		const creative: Creative = {
			id: randomUUID(),
			campaignId,
			headline: input.headline,
			body: input.body,
			destinationUrl: input.destinationUrl
		};

		return this.creativeRepository.save(creative);
	}
}
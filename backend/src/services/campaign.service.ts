import { randomUUID } from "node:crypto";
import type {Campaign, CreateCampaignInput, } from "../domain/campaign.js";
import { AppError } from "../errors/app-error.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";

export class CampaignService {
	constructor(
		private readonly campaignRepository: CampaignRepository,
	) {}

	async getCampaigns(): Promise<Campaign[]> {
		return this.campaignRepository.findAll();
	}

	async getCampaignById(id: string): Promise<Campaign> {
		const campaign = await this.campaignRepository.findById(id);

		if (!campaign) {
			throw new AppError(
				"Campaign not found",
				404,
			);
		}

		return campaign;
	}

	async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
		const campaign: Campaign = {
			id: randomUUID(),
			name: input.name,
			budget: input.budget,
			spent: 0,
			status: "DRAFT",
		};

		return this.campaignRepository.save(campaign);
	}
}
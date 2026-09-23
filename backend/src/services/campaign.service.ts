import { randomUUID } from "node:crypto";
import type {Campaign, CreateCampaignInput, CampaignStatus } from "../domain/campaign.js";
import { AppError } from "../errors/app-error.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";

const allowedStatusTransitions: Record<CampaignStatus, CampaignStatus[]> = {
	DRAFT: [ "ACTIVE" ],
	ACTIVE: [ "PAUSED", "COMPLETED" ],
	PAUSED: [ "ACTIVE", "COMPLETED" ],
	COMPLETED: []
};

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

	async updateCampaignStatus(id: string, newStatus: CampaignStatus): Promise<Campaign> {
		const campaign = await this.campaignRepository.findById(id);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.status === newStatus) {
			return campaign;
		}

		const allowedTransitions = allowedStatusTransitions[campaign.status];

		if (!allowedTransitions.includes(newStatus)) {
			throw new AppError(
				 `Cannot transition campaign from ${campaign.status} to ${newStatus}`,
      409,
    	);
		}

		const updatedCampaign = await this.campaignRepository.updateStatus(id, newStatus);

		if (!updatedCampaign) {
			throw new AppError("Campaign not found", 404);
		}

		return updatedCampaign;
	}
}
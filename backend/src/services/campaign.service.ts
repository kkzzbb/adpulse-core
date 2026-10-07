import { randomUUID } from "node:crypto";
import type {Campaign, CreateCampaignInput, CampaignStatus,
	UpdateCampaignInput, CreateCampaignWithCreativeInput
 } from "../domain/campaign.js";
import { AppError } from "../errors/app-error.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { CreativeRepository } from "../repositories/creative.repository.js";
import type { TransactionManager } from "../transactions/transaction-manager.js";
import { Creative } from "../domain/creative.js";

const allowedStatusTransitions: Record<CampaignStatus, CampaignStatus[]> = {
	DRAFT: [ "ACTIVE" ],
	ACTIVE: [ "PAUSED", "COMPLETED" ],
	PAUSED: [ "ACTIVE", "COMPLETED" ],
	COMPLETED: []
};

export class CampaignService {
	constructor(
		private readonly campaignRepository: CampaignRepository,
		private readonly creativeRepository: CreativeRepository,
		private readonly transactionManager: TransactionManager
	) {}

	async getCampaigns(userId: string): Promise<Campaign[]> {
		return this.campaignRepository.findAllByUserId(userId);
	}

	async getCampaignById(userId: string, id: string): Promise<Campaign> {
		const campaign = await this.campaignRepository.findByIdForUser(userId, id);

		if (!campaign) {
			throw new AppError("Campaign not found",404);
		}

		return campaign;
	}

	async createCampaign(userId: string, input: CreateCampaignInput): Promise<Campaign> {
		const campaign: Campaign = {
			id: randomUUID(),
			userId,
			name: input.name,
			budget: input.budget,
			spent: 0,
			status: "DRAFT",
		};

		return this.campaignRepository.save(campaign);
	}

	async updateCampaignStatus(userId: string, id: string, newStatus: CampaignStatus): Promise<Campaign> {
		const campaign = await this.getCampaignById(userId, id);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.status === newStatus) {
			return campaign;
		}

		if (newStatus === "ACTIVE") {
			const hasCreative = await this.creativeRepository.existsByCampaignId(id);

			if (!hasCreative) {
				throw new AppError("Campaign must have at least one creative before activation", 409);
			}
		}

		const allowedTransitions = allowedStatusTransitions[campaign.status];

		if (!allowedTransitions.includes(newStatus)) {
			throw new AppError(
				 `Cannot transition campaign from ${campaign.status} to ${newStatus}`,
      409,
    	);
		}

		const updatedCampaign = await this.campaignRepository.updateStatusForUser(userId, id, newStatus);

		if (!updatedCampaign) {
			throw new AppError("Campaign not found", 404);
		}

		return updatedCampaign;
	}

	async updateCampaignBudget(userId: string, id: string, newBudget: number): Promise<Campaign> {
		const campaign = await this.getCampaignById(userId, id);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.status === "COMPLETED") {
			throw new AppError("Completed campaigns cannot be modified", 409);
		}

		if (newBudget < campaign.spent) {
			throw new AppError(`Budget cannot be lower than already spent amount (${campaign.spent})`, 409);
		}

		if (newBudget === campaign.budget) {
			return campaign;
		}

		const updatedCampaign = await this.campaignRepository.updateBudgetForUser(userId, id, newBudget);

		if (!updatedCampaign) {
			throw new AppError("Campaign not found", 404);
		}

		return updatedCampaign;
	}

	async updateCampaign(userId: string, id: string, input: UpdateCampaignInput): Promise<Campaign> {
		const campaign = await this.getCampaignById(userId, id);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.status === "COMPLETED") {
			throw new AppError("Completed campaigns cannot be modified", 409);
		}

		if (campaign.name === input.name) {
			return campaign;
		}

		const updatedCampaign = await this.campaignRepository.updateNameForUser(userId, id, input.name);

		if(!updatedCampaign) {
			throw new AppError("Campaign not found", 404);
		}

		return updatedCampaign;
	}

	async archiveCampaign(userId: string, id: string): Promise<void> {
		const campaign = await this.getCampaignById(userId, id);

		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.status === "ACTIVE") {
			throw new AppError("Active campaigns must be paused or completed before archiving", 409);
		}

		const archived = await this.campaignRepository.archiveForUser(userId, id);

		if (!archived) {
			throw new AppError("Campaign not found", 404);
		}
	}

	async createCampaignWithCreative(userId: string, input: CreateCampaignWithCreativeInput){
		return this.transactionManager.run(async ({
			campaignRepository, creativeRepository
			}) => {
				const campaign: Campaign = {
					id: randomUUID(),
					userId,
					name: input.name,
					budget: input.budget,
					spent: 0,
					status: "DRAFT",
				};
			
				const savedCampaign = await campaignRepository.save(campaign);
				
				const creative: Creative = {
					id: randomUUID(),
					campaignId: savedCampaign.id,
					headline: input.creative.headline,
					body: input.creative.body,
					destinationUrl: input.creative.destinationUrl
				};

				const savedCreative = await creativeRepository.save(creative);

				return { campaign: savedCampaign, creative: savedCreative };
			});
	}
}
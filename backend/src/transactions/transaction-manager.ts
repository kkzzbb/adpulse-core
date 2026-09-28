import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { CreativeRepository } from "../repositories/creative.repository.js";

export interface TransactionContext {
	campaignRepository: CampaignRepository;
	creativeRepository: CreativeRepository;
}

export interface TransactionManager {
	run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}
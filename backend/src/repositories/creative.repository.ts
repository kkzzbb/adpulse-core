import type { Creative } from "../domain/creative.js";

export interface CreativeRepository {
	findByCampaignId(campaignId: string): Promise<Creative[]>;

	existsByCampaignId(campaignId: string): Promise<boolean>;

	save(creative: Creative): Promise<Creative>;
}
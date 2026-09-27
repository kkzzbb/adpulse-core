import type { Creative } from "../domain/creative.js";

export interface CreativeRepository {
	findByCampaignId(campaignId: string): Promise<Creative[]>;

	save(creative: Creative): Promise<Creative>;
}
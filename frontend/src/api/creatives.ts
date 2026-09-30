import type { Creative } from "../types/creative";

export async function getCampaignCreatives(campaignId: string): Promise<Creative[]> {
	const response = await fetch(`/api/campaigns/${campaignId}/creatives`);

	if (!response.ok) {
		throw new Error(`Failed to fetch creatives: ${response.status}`);
	}

	const creatives: Creative[] = await response.json();

	return creatives;
}
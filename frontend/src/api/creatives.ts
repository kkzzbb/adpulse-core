import type { Creative, CreateCreativeInput } from "../types/creative";
import { createApiError } from "./http";

export async function getCampaignCreatives(campaignId: string): Promise<Creative[]> {
	const response = await fetch(`/api/campaigns/${campaignId}/creatives`);

	if (!response.ok) {
		throw new Error(`Failed to fetch creatives: ${response.status}`);
	}

	const creatives: Creative[] = await response.json();

	return creatives;
}

export async function createCreative(campaignId: string, input:CreateCreativeInput): Promise<Creative> {
	const response = await fetch(`/api/campaigns/${campaignId}/creatives`,
		{
			method: "POST",
			headers: {"Content-Type":"application/json"},
			body: JSON.stringify(input)
		}
	);

	if (!response.ok) {
		throw await createApiError(response, "Failed to create creative");
	}

	const creative: Creative = await response.json();

	return creative;
}
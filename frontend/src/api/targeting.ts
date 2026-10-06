import type { CampaignTargeting, UpdateCampaignTargetingInput } from "../types/targeting";
import { createApiError } from "./http";

export async function getCampaignTargeting(campaignId: string): Promise<CampaignTargeting> {
  const response = await fetch(
		`/api/campaigns/${campaignId}/targeting`, 
		{credentials: "include"}
  );

  if (!response.ok) {
    throw await createApiError(response, "Failed to load campaign targeting");
  }

  return response.json();
}

export async function updateCampaignTargeting(
  campaignId: string,
  input:UpdateCampaignTargetingInput
): Promise<CampaignTargeting> {
  const response = await fetch(
    `/api/campaigns/${campaignId}/targeting`,
    {
			method: "PUT",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await createApiError(response, "Failed to update campaign targeting");
  }

  return response.json();
}
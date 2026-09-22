import type { Campaign } from "../types/campaign.ts";

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch("/api/campaigns");
  if (!response.ok) {
    throw new Error(`Failed to fetch campaigns: ${response.status}`,
    );
  }
  const data: Campaign[] = await response.json();
  return data;
}

export interface CreateCampaignInput {
  name: string;
  budget: number;
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<Campaign> {
  const response = await fetch("/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create campaign: ${response.status}`,
    );
  }

  const campaign: Campaign = await response.json();

  return campaign;
}

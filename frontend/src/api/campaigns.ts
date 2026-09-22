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

import type { Campaign, CampaignStatus } from "../types/campaign";
import { readErrorMessage } from "./http";

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

export async function getCampaignById(id: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch campaign: ${response.status}`);
  }

  const campaign: Campaign = await response.json();

  return campaign;
}

export async function updateCampaignName(id:string, name: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`,
    {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({name})
    });
  
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to udpate camapign"));
  }

  const campaign: Campaign = await response.json();

  return campaign;
}

export async function updateCampaignBudget(id: string, budget: number): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}/budget`,
    {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({budget})
    });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to update budget"));
  }

  const campaign: Campaign = await response.json();

  return campaign;
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}/status`,
    {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({status})
    });
  
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to update campaign status"));
  }

  const campaign: Campaign = await response.json();

  return campaign;
}
  
export async function archiveCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${id}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to archive campaign"));
  }
}
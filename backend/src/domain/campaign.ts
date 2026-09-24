export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED";

export interface Campaign {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
}

export interface CreateCampaignInput {
  name: string;
  budget: number;
}

export interface UpdateCampaignInput {
  name: string;
}

export interface UpdateCampaignStatusInput {
  status: CampaignStatus;
}

export interface UpdateCampaignBudgetInput {
  budget: number;
}
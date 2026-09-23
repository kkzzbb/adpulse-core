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

export interface UpdateCampaignStatusInput {
  status: CampaignStatus;
}
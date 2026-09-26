export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED";

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
}
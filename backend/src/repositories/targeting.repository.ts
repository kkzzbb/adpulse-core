import type { CampaignTargeting } from "../domain/targeting.js";

export interface TargetingRepository {
  findByCampaignId(campaignId: string): Promise<CampaignTargeting | null>;

  upsert(targeting: CampaignTargeting): Promise<CampaignTargeting>;
}
import type { CampaignTargeting, UpdateCampaignTargetingInput } from "../domain/targeting.js";
import { AppError } from "../errors/app-error.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { TargetingRepository } from "../repositories/targeting.repository.js";

export class TargetingService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly targetingRepository: TargetingRepository,
  ) {}

  async getCampaignTargeting(userId: string, campaignId: string): Promise<CampaignTargeting> {
    const campaign = await this.campaignRepository.findByIdForUser(userId, campaignId);

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    const targeting = await this.targetingRepository.findByCampaignId(campaignId);

    if (targeting) {
      return targeting;
    }

    return {
      campaignId,
      countries: [],
      devices: [],
      ageMin: null,
      ageMax: null,
    };
  }

  async updateCampaignTargeting(
    userId: string,
    campaignId: string,
    input: UpdateCampaignTargetingInput
  ): Promise<CampaignTargeting> {
    const campaign = await this.campaignRepository.findByIdForUser(userId, campaignId);

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    if (campaign.status !== "DRAFT") {
      throw new AppError("Targeting can only be modified for draft campaigns", 409);
    }

    const targeting: CampaignTargeting = {
      campaignId,
      countries: input.countries,
      devices: input.devices,
      ageMin: input.ageMin,
      ageMax: input.ageMax,
    };

    return this.targetingRepository.upsert(targeting);
  }
}
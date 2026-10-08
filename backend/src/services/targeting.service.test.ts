import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Campaign } from "../domain/campaign.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { TargetingRepository } from "../repositories/targeting.repository.js";
import { TargetingService } from "./targeting.service.js";

const userId = "11111111-1111-4111-8111-111111111111";

const campaignId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function campaign(status: Campaign["status"] = "DRAFT"): Campaign {
  return {
    id: campaignId,
    userId,
    name: "Targeting Test",
    budget: 5000,
    spent: 0,
    status,
  };
}

function createCampaignRepositoryMock(): CampaignRepository {
	return {
		findAllByUserId: vi.fn(),

		findByIdForUser: vi.fn(),

		save: vi.fn(),

		updateNameForUser: vi.fn(),

		updateStatusForUser: vi.fn(),

		updateBudgetForUser: vi.fn(),

		archiveForUser: vi.fn()
	};
}

function createTargetingRepositoryMock(): TargetingRepository {
  return {
    findByCampaignId: vi.fn(),

    upsert: vi.fn()
  };
}

describe("TargetingService",
  () => {
    let campaignRepository: CampaignRepository;

    let targetingRepository: TargetingRepository;

    let service: TargetingService;

    beforeEach(() => {
      campaignRepository = createCampaignRepositoryMock();

      targetingRepository = createTargetingRepositoryMock();

      service = new TargetingService(
          campaignRepository,
          targetingRepository
        );
    });

    it("returns unrestricted defaults when no targeting row exists",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(campaign());

        vi.mocked(targetingRepository.findByCampaignId)
					.mockResolvedValue(null);

        const result = await service.getCampaignTargeting(
          userId, campaignId);

        expect(result).toEqual({
					campaignId,
          countries: [],
          devices: [],
          ageMin: null,
          ageMax: null,
        });
      },
    );

    it("updates targeting for an owned draft campaign",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(campaign("DRAFT"));

        vi.mocked(targetingRepository.upsert).mockImplementation(
          async (targeting) => targeting);

        const result = await service.updateCampaignTargeting(
          userId, campaignId,
          {
						countries: ["FI", "SE"],
						devices: ["MOBILE"],
						ageMin: 18,
						ageMax: 40,
					}
				);

        expect(targetingRepository.upsert).toHaveBeenCalledWith({
          campaignId,
          countries: ["FI", "SE"],
          devices: ["MOBILE"],
          ageMin: 18,
          ageMax: 40,
        });

        expect(result.countries).toEqual(["FI", "SE"]);
      },
    );

    it("rejects targeting changes after activation",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(campaign("ACTIVE"));

        await expect(service.updateCampaignTargeting(userId, campaignId,
					{
						countries: [],
						devices: [],
						ageMin: null,
						ageMax: null,
					},
				)).rejects.toThrow(
          "Targeting can only be modified for draft campaigns");

        expect(targetingRepository.upsert).not.toHaveBeenCalled();
      }
    );


    it("does not access targeting for a campaign unavailable to the user",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(null);

        await expect(service.getCampaignTargeting(userId, campaignId))
					.rejects.toThrow("Campaign not found");

        expect(targetingRepository.findByCampaignId).not.toHaveBeenCalled();
      }
    );
  }
);
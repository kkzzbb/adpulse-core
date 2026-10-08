import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Campaign } from "../domain/campaign.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { CreativeRepository } from "../repositories/creative.repository.js";
import { CreativeService } from "./creative.service.js";

const userId = "11111111-1111-4111-8111-111111111111";

const campaignId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function createCampaign(
  status: Campaign["status"] = "DRAFT"
	): Campaign {
  	return {
    	id: campaignId,
			userId,
			name: "Test Campaign",
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

function createCreativeRepositoryMock(): CreativeRepository {
  return {
    findByCampaignId: vi.fn(),

    existsByCampaignId: vi.fn(),

    save: vi.fn()
  };
}

describe("CreativeService",
  () => {
    let campaignRepository: CampaignRepository;

    let creativeRepository: CreativeRepository;

    let service: CreativeService;

    beforeEach(() => {
      campaignRepository = createCampaignRepositoryMock();

      creativeRepository = createCreativeRepositoryMock();

      service = new CreativeService(
          campaignRepository,
          creativeRepository
        );
    });

    it("creates a creative for an owned draft campaign",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(createCampaign("DRAFT"));

				vi.mocked(creativeRepository.save).
					mockImplementation(async (creative) => creative);

				const result = await service.createCreative(userId, campaignId,
					{
            headline: "Test headline",
            body: "Test body",
            destinationUrl: "https://example.com",
          });


        expect(result.campaignId).toBe(campaignId);

        expect(creativeRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            campaignId,
            headline: "Test headline",
            body: "Test body",
            destinationUrl: "https://example.com"
          }),
        );
      },
    );


    it("rejects creative creation for an active campaign",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(createCampaign("ACTIVE"));

				await expect(service.createCreative(userId, campaignId,
            {
              headline: "Test",
              body: "Test",
              destinationUrl: "https://example.com",
            }
          )).rejects.toThrow();

				expect(creativeRepository.save).not.toHaveBeenCalled();
      },
    );

    it("rejects creative creation when the campaign is not available to the user",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(null);

        await expect(service.createCreative(userId, campaignId,
            {
              headline: "Attack",
              body: "Attack",
              destinationUrl: "https://example.com",
            }
          )).rejects.toThrow("Campaign not found");

        expect(creativeRepository.save).not.toHaveBeenCalled();
      });

    it("does not query creatives before authorizing the parent campaign",
      async () => {
        vi.mocked(campaignRepository.findByIdForUser)
					.mockResolvedValue(null);

        await expect(service.getCampaignCreatives(userId, campaignId))
					.rejects.toThrow("Campaign not found");

				expect(creativeRepository.findByCampaignId)
					.not.toHaveBeenCalled();
      },
    );
  },
);
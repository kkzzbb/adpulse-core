import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Campaign } from "../domain/campaign.js";
import type { CampaignRepository } from "../repositories/campaign.repository.js";
import type { CreativeRepository } from "../repositories/creative.repository.js";
import type { TransactionManager } from "../transactions/transaction-manager.js";
import { CampaignService } from "./campaign.service.js";

const aliceId = "11111111-1111-4111-8111-111111111111";

const campaignId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function createDraftCampaign(): Campaign {
	return {
		id: campaignId,
		userId: aliceId,
		name: "Test Campaign",
		budget: 5000,
		spent: 1000,
		status: "DRAFT"
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

		save: vi.fn(),
	};
}

function createTransactionManagerMock(): TransactionManager {
	return {
		run: vi.fn(),
	};
}


describe("CampaignService", () => {
  let campaignRepository: CampaignRepository;

  let creativeRepository: CreativeRepository;

  let transactionManager: TransactionManager;

  let campaignService: CampaignService;

  beforeEach(() => {
    campaignRepository = createCampaignRepositoryMock();

    creativeRepository = createCreativeRepositoryMock();

    transactionManager = createTransactionManagerMock();

    campaignService = new CampaignService(
      campaignRepository,
      creativeRepository,
      transactionManager,
    );
  });

	it("returns a campaign owned by the authenticated user",
		async () => {
			const campaign = createDraftCampaign();

			vi.mocked(campaignRepository.findByIdForUser)
				.mockResolvedValue(campaign);

			const result = await campaignService.getCampaignById(aliceId, campaignId);

			expect(result).toEqual(campaign);

			expect(campaignRepository.findByIdForUser)
				.toHaveBeenCalledWith(aliceId, campaignId);
		}
	);

	it("rejects a campaign that is not available to the user",
		async () => {
			vi.mocked(campaignRepository.findByIdForUser)
				.mockResolvedValue(null);

			await expect(campaignService.getCampaignById(aliceId,	campaignId))
				.rejects.toThrow("Campaign not found");
		},
	);

	it("lists campaigns for the authenticated user",
		async () => {
			const campaign = createDraftCampaign();
			
			vi.mocked(campaignRepository.findAllByUserId)
				.mockResolvedValue([campaign]);

			const result = await campaignService.getCampaigns(aliceId);

			expect(result).toEqual([campaign]);
			
			expect(campaignRepository.findAllByUserId)
				.toHaveBeenCalledWith(aliceId);
		}
	);

	it("rejects activation when the campaign has no creative",
		async () => {
			const campaign = createDraftCampaign();

			vi.mocked(campaignRepository.findByIdForUser)
				.mockResolvedValue(campaign);

			vi.mocked(creativeRepository.existsByCampaignId)
				.mockResolvedValue(false);

			await expect(campaignService.updateCampaignStatus(
				aliceId, campaignId, "ACTIVE"))
				.rejects.toThrow(
				"Campaign must have at least one creative before activation");

			expect(campaignRepository.updateStatusForUser)
				.not.toHaveBeenCalled();
		}
	);

	it("activates a draft campaign when a creative exists",
  	async () => {
		  const campaign = createDraftCampaign();

		  const activeCampaign: Campaign = {...campaign, status: "ACTIVE"};

			vi.mocked(campaignRepository.findByIdForUser)
      	.mockResolvedValue(campaign);

			vi.mocked(creativeRepository.existsByCampaignId)
				.mockResolvedValue(true);

			vi.mocked(campaignRepository.updateStatusForUser)
				.mockResolvedValue(activeCampaign);

			const result = await campaignService.updateCampaignStatus(
				aliceId, campaignId, "ACTIVE");
				
			expect(result.status).toBe("ACTIVE");

			expect(campaignRepository.updateStatusForUser)
				.toHaveBeenCalledWith(aliceId, campaignId, "ACTIVE");
		}
	);

	function createCompletedCampaign(): Campaign {
		return {
			...createDraftCampaign(),

			status: "COMPLETED"
		};
	}

	it("rejects transitions from a completed campaign",
  	async () => {
			vi.mocked(campaignRepository.findByIdForUser)
      	.mockResolvedValue(createCompletedCampaign());

			await expect(campaignService.updateCampaignStatus(
        aliceId, campaignId, "ACTIVE"))
				.rejects.toThrow(
      	"Cannot transition campaign from COMPLETED to ACTIVE");

			expect(creativeRepository.existsByCampaignId).not.toHaveBeenCalled();

			expect(campaignRepository.updateStatusForUser).not.toHaveBeenCalled();
  	}
	);

	it("returns the campaign unchanged when status is already the requested status",
		async () => {
			const activeCampaign:	Campaign = {
				...createDraftCampaign(),
				status: "ACTIVE"
			};

			vi.mocked(campaignRepository.findByIdForUser)
				.mockResolvedValue(activeCampaign);

			const result = await campaignService.updateCampaignStatus(
				aliceId, campaignId, "ACTIVE");

			expect(result).toEqual(activeCampaign);

			expect(creativeRepository.existsByCampaignId).not.toHaveBeenCalled();

			expect(campaignRepository.updateStatusForUser).not.toHaveBeenCalled();
		}
	);

	it("rejects a budget below the amount already spent",
  	async () => {
			const campaign: Campaign = {
      	...createDraftCampaign(),
				budget: 5000,
				spent: 1200
    	};
			
			vi.mocked(campaignRepository.findByIdForUser)
      	.mockResolvedValue(campaign);

			await expect(campaignService.updateCampaignBudget(
          aliceId, campaignId, 1000))
					.rejects.toThrow(
      		"Budget cannot be lower than already spent amount");

			expect(campaignRepository.updateBudgetForUser).not.toHaveBeenCalled();
  	}
	);

	it("rejects budget changes for completed campaigns",
  	async () => {
			vi.mocked(campaignRepository.findByIdForUser)
      	.mockResolvedValue(createCompletedCampaign());

			await expect(campaignService.updateCampaignBudget(
        aliceId, campaignId, 6000))
				.rejects.toThrow(
      	"Completed campaigns cannot be modified");

			expect(campaignRepository.updateBudgetForUser).not.toHaveBeenCalled();
  	}
	);

	it("rejects archiving an active campaign",
  	async () => {
			const campaign: Campaign = {
      	...createDraftCampaign(),
				status: "ACTIVE"
    	};
			
			vi.mocked(campaignRepository.findByIdForUser)
      	.mockResolvedValue(campaign);

			await expect(campaignService.archiveCampaign(
          aliceId, campaignId))
					.rejects.toThrow(
      		"Active campaigns must be paused or completed before archiving");

			expect(campaignRepository.archiveForUser).not.toHaveBeenCalled();
  	}
	);

	it("archives an owned draft campaign",
  	async () => {
			vi.mocked(campaignRepository.findByIdForUser)
      	.mockResolvedValue(createDraftCampaign());

			vi.mocked(campaignRepository.archiveForUser)
      	.mockResolvedValue(true);

			await campaignService.archiveCampaign(aliceId, campaignId);

    	expect(campaignRepository.archiveForUser).toHaveBeenCalledWith(
      	aliceId, campaignId);
  	}
	);
});
import type { Campaign, CampaignStatus } from "../domain/campaign.js";

export interface CampaignRepository {
	findAllByUserId(userId: string): Promise<Campaign[]>;

	findByIdForUser(userId: string, id: string): Promise<Campaign | null>;

	save(campaign: Campaign): Promise<Campaign>;

	updateNameForUser(userId: string, id: string, name: string): Promise<Campaign | null>;

	updateStatusForUser(userId: string, id: string, status: CampaignStatus): Promise<Campaign | null>;

	updateBudgetForUser(userId: string, id: string, budget: number): Promise<Campaign | null>;

	archiveForUser(userId: string, id: string): Promise<boolean>;
}

const FIXTURE_USER_ID = "00000000-0000-4000-8000-000000000001";

export class InMemoryCampaignRepository implements CampaignRepository
{
	private campaigns: Campaign[] = [
		{
			id: "campaign-1",
			userId: FIXTURE_USER_ID,
      name: "Summer Sale",
      budget: 5000,
      spent: 1250,
      status: "ACTIVE", 
		},
		{
      id: "campaign-2",
      userId: FIXTURE_USER_ID,
      name: "Autumn Launch",
      budget: 8000,
      spent: 0,
      status: "DRAFT",
    },
	];

	private readonly archivedIds = new Set<string>();

	async findAllByUserId(userId: string): Promise<Campaign[]> {
		return this.campaigns.filter(
			(campaign) => campaign.userId === userId && !this.archivedIds.has(campaign.id)
		).map((campaign) => ({ ...campaign }));
	}

	async findByIdForUser(userId: string, id: string): Promise<Campaign | null> {
		if (this.archivedIds.has(id)) {
			return null;
		}

		const campaign = this.campaigns.find(
			(campaign) => campaign.id === id && campaign.userId === userId,
		);

		return campaign? { ...campaign } : null;
	}

	async save(campaign: Campaign): Promise<Campaign> {
		this.campaigns.push({ ...campaign, });

		return { ...campaign, };
	}

	async updateStatusForUser(userId: string,id: string, status: CampaignStatus): Promise<Campaign | null> {
		const index = this.campaigns.findIndex(
			(campaign) => campaign.id === id && campaign.userId === userId  &&
          !this.archivedIds.has(campaign.id)
		);
		
		if (index === -1) {
			return null;
		}

		const currentCampaign = this.campaigns[index];

		if (!currentCampaign) {
			return null;
		}

		const updatedCampaign: Campaign = {
			...currentCampaign, status
		};

		this.campaigns[index] = updatedCampaign;

		return { ...updatedCampaign };
	}

	async updateBudgetForUser(userId: string, id: string, budget: number): Promise<Campaign | null> {
		const index = this.campaigns.findIndex(
			(campaign) => campaign.id === id && campaign.userId === userId &&
					!this.archivedIds.has(campaign.id)
		);

		if (index === -1) {
			return null;
		}

		const currentCampaign = this.campaigns[index];

		if (!currentCampaign) {
			return null;
		}

		const updatedCampaign: Campaign = {
			...currentCampaign, budget
		};

		this.campaigns[index] = updatedCampaign;

		return { ...updatedCampaign };
	}

	async updateNameForUser(userId: string, id: string, name: string): Promise<Campaign | null> {
		if (this.archivedIds.has(id)) {
			return null;
		}

		const index = this.campaigns.findIndex(
			(campaign) => campaign.id === id && campaign.userId === userId &&
					!this.archivedIds.has(campaign.id)
		);

		if (index === -1) {
			return null;
		}

		const currentCampaign = this.campaigns[index];

		if (!currentCampaign) {
			return null;
		}

		const updatedCampaign: Campaign = {
			...currentCampaign, name
		};

		this.campaigns[index] = updatedCampaign;

		return { ...updatedCampaign };
	}

	async archiveForUser(userId: string, id: string): Promise<boolean> {
		const campaign = this.campaigns.find(
			(campaign) => campaign.id === id && campaign.userId === userId
		);

		if (!campaign || this.archivedIds.has(id)) {
			return false;
		}

		this.archivedIds.add(id);

		return true;
	}
}
import type { Campaign, CampaignStatus } from "../domain/campaign.js";

export interface CampaignRepository {
	findAll(): Promise<Campaign[]>;

	findById(id: string): Promise<Campaign | null>;

	save(campaign: Campaign): Promise<Campaign>;

	updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null>;

	updateBudget(id: string, budget: number): Promise<Campaign | null>;
}

export class InMemoryCampaignRepository implements CampaignRepository
{
	private campaigns: Campaign[] = [
		{
			id: "campaign-1",
      name: "Summer Sale",
      budget: 5000,
      spent: 1250,
      status: "ACTIVE", 
		},
		{
      id: "campaign-2",
      name: "Autumn Launch",
      budget: 8000,
      spent: 0,
      status: "DRAFT",
    },
	];

	async findAll(): Promise<Campaign[]> {
		return this.campaigns.map(
			(campaign) => ({ ...campaign}),
		);
	}

	async findById(id: string): Promise<Campaign | null> {
		const campaign = this.campaigns.find(
			(campaign) => campaign.id === id,
		);

		return campaign? { ...campaign } : null;
	}

	async save(campaign: Campaign): Promise<Campaign> {
		this.campaigns.push({ ...campaign, });

		return { ...campaign, };
	}

	async updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null> {
		const index = this.campaigns.findIndex(
			(campaign) => campaign.id === id
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

	async updateBudget(id: string, budget: number): Promise<Campaign | null> {
		const index = this.campaigns.findIndex(
			(campaign) => campaign.id === id
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
}
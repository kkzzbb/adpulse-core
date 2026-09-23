import type { Campaign } from "../domain/campaign.js";

export interface CampaignRepository {
	findAll(): Promise<Campaign[]>;

	findById(id: string): Promise<Campaign | null>;

	save(campaign: Campaign): Promise<Campaign>;
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
}
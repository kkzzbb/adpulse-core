import type { Campaign, CampaignStatus } from "../domain/campaign.js";

export interface CampaignRepository {
	findAll(): Promise<Campaign[]>;

	findById(id: string): Promise<Campaign | null>;

	save(campaign: Campaign): Promise<Campaign>;

	updateName(id: string, name: string): Promise<Campaign | null>;

	updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null>;

	updateBudget(id: string, budget: number): Promise<Campaign | null>;

	archive(id: string): Promise<boolean>;
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

	async findAll(): Promise<Campaign[]> {
		return this.campaigns.filter(
			(campaign) => !this.archivedIds.has(campaign.id)
		).map((campaign) => ({ ...campaign }));
	}

	async findById(id: string): Promise<Campaign | null> {
		if (this.archivedIds.has(id)) {
			return null;
		}

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

	async updateName(id: string, name: string): Promise<Campaign | null> {
		if (this.archivedIds.has(id)) {
			return null;
		}

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
			...currentCampaign, name
		};

		this.campaigns[index] = updatedCampaign;

		return { ...updatedCampaign };
	}

	async archive(id: string): Promise<boolean> {
		const campaign = this.campaigns.find(
			(campaign) => campaign.id === id
		);

		if (!campaign || this.archivedIds.has(id)) {
			return false;
		}

		this.archivedIds.add(id);

		return true;
	}
}

backend/.env.example
backend/src/app.ts
backend/src/auth/authController.ts
backend/src/auth/authRepository.ts
backend/src/auth/authRoutes.ts
backend/src/auth/authService.ts
backend/src/auth/postgresAuthRepository.ts
backend/src/config/env.ts
backend/src/controllers/campaign.controller.ts
backend/src/controllers/creative.controller.ts
backend/src/repositories/campaign.repository.ts
backend/src/services/campaign.service.ts
backend/src/services/creative.service.ts
backend/src/auth/getAuthenticatedUserId.ts
backend/src/auth/requireAuth.ts
backend/src/types/express.d.ts
package-lock.json
package.json
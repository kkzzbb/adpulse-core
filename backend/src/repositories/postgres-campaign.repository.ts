import type { Pool, QueryResultRow } from "pg";
import type { Campaign, CampaignStatus } from "../domain/campaign.js";
import type { CampaignRepository } from "./campaign.repository.js";

interface CampaignRow extends QueryResultRow {
	id: string;
	name: string;

	budget: string;
	spent: string;

	status: CampaignStatus;
}

function mapCampaignRow(row: CampaignRow): Campaign {
	return {
		id: row.id,
		name: row.name,
		
		budget: Number(row.budget),
		spent: Number(row.spent),

		status: row.status,
	};
}

export class PostgresCampaignRepository implements CampaignRepository {
	constructor(private readonly pool: Pool) {}

	async findAll(): Promise<Campaign[]> {
		const result = await this.pool.query<CampaignRow>(`
			SELECT id, name, budget, spent, status
			FROM campaigns
			ORDER BY created_at DESC`);
	
		return result.rows.map(mapCampaignRow);
	}


	async findById(id: string): Promise<Campaign | null> {
		const result = await this.pool.query<CampaignRow>(`
			SELECT id, name, budget, spent, status
			FROM campaigns
			WHERE id = $1`,
			[id],
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async save(campaign: Campaign): Promise<Campaign> {
		const result = await this.pool.query<CampaignRow>(
			`
			INSERT INTO campaigns (id, name, budget, spent, status)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, name, budget, spent, status`,
			[
				campaign.id,
				campaign.name,
				campaign.budget,
				campaign.spent,
				campaign.status,
			],
		);

		const row = result.rows[0];

		if (!row) {
			throw new Error("Campaign insert returned no row");
		}

		return mapCampaignRow(row);
	}

	async updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null> {
		const result = await this.pool.query<CampaignRow>(
			`
			UPDATE campaigns
			SET status = $2, updated_at = NOW()
			WHERE id = $1
			RETURNING	id,	name,	budget,	spent, status`,
				[
					id,
					status,
				]
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async updateBudget(id: string, budget: number): Promise<Campaign | null> {
		const result = await this.pool.query<CampaignRow>(
			`
			UPDATE campaigns
			SET budget = $2, updated_at = NOW()
			Where id = $1
			RETURNING id, name, budget, spent, status`,
			[
				id,
				budget,
			]
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return mapCampaignRow(row);
	}
}
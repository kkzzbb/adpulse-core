import type { QueryResultRow } from "pg";
import type { Queryable } from "../db/queryable.js";
import type { Campaign, CampaignStatus } from "../domain/campaign.js";
import type { CampaignRepository } from "./campaign.repository.js";

interface CampaignRow extends QueryResultRow {
	id: string;
	name: string;
	user_id: string;
	budget: string;
	spent: string;

	status: CampaignStatus;
}

function mapCampaignRow(row: CampaignRow): Campaign {
	return {
		id: row.id,
		name: row.name,
		userId: row.user_id,
		budget: Number(row.budget),
		spent: Number(row.spent),
		status: row.status,
	};
}

export class PostgresCampaignRepository implements CampaignRepository {
	constructor(private readonly db: Queryable) {}

	async findAll(): Promise<Campaign[]> {
		const result = await this.db.query<CampaignRow>(`
			SELECT id, user_id, name, budget, spent, status
			FROM campaigns
			WHERE archived_at IS NULL
			ORDER BY created_at DESC`);
	
		return result.rows.map(mapCampaignRow);
	}


	async findById(id: string): Promise<Campaign | null> {
		const result = await this.db.query<CampaignRow>(
			`
			SELECT id, user_id, name, budget, spent, status
			FROM campaigns
			WHERE id = $1 AND archived_at IS NULL`,
			[id],
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async save(campaign: Campaign): Promise<Campaign> {
		const result = await this.db.query<CampaignRow>(
			`
			INSERT INTO campaigns (id, user_id, name, budget, spent, status)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id, user_id, name, budget, spent, status`,
			[
				campaign.id,
				campaign.userId,
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
		const result = await this.db.query<CampaignRow>(
			`
			UPDATE campaigns
			SET status = $2, updated_at = NOW()
			WHERE id = $1 AND archived_at IS NULL
			RETURNING	id, user_id, name,	budget,	spent, status`,
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
		const result = await this.db.query<CampaignRow>(
			`
			UPDATE campaigns
			SET budget = $2, updated_at = NOW()
			WHERE id = $1 AND archived_at IS NULL
			RETURNING id, user_id, name, budget, spent, status`,
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

	async updateName(id: string, name: string): Promise<Campaign | null> {
		const result = await this.db.query<CampaignRow>(
			`
			UPDATE campaigns
			SET name = $2, updated_at = NOW()
			WHERE id = $1 AND archived_at IS NULL
			RETURNING id, user_id, name, budget, spent, status`,
			[
				id,
				name,
			]
		);

		const row = result.rows[0];

		if(!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async archive(id: string): Promise<boolean> {
		const result = await this.db.query(
			`
			UPDATE campaigns
			SET archived_at = NOW(), updated_at = NOW()
			WHERE id = $1 AND archived_at IS NULL
			RETURNING id`,
			[id]
		);
		
		return result.rowCount === 1;
	}
}
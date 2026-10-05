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

	async findAllByUserId(userId: string): Promise<Campaign[]> {
		const result = await this.db.query<CampaignRow>(`
			SELECT id, user_id, name, budget, spent, status
			FROM campaigns
			WHERE user_id = $1 AND archived_at IS NULL
			ORDER BY created_at DESC`, [userId]);
	
		return result.rows.map(mapCampaignRow);
	}


	async findByIdForUser(userId: string, id: string): Promise<Campaign | null> {
		const result = await this.db.query<CampaignRow>(
			`
			SELECT id, user_id, name, budget, spent, status
			FROM campaigns
			WHERE id = $1 AND user_id = $2 AND archived_at IS NULL`,
			[id, userId],
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

	async updateStatusForUser(userId: string, id: string, status: CampaignStatus): Promise<Campaign | null> {
		const result = await this.db.query<CampaignRow>(
			`
			UPDATE campaigns
			SET status = $3, updated_at = NOW()
			WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
			RETURNING	id, user_id, name,	budget,	spent, status`,
				[id, userId, status]
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async updateBudgetForUser(userId: string, id: string, budget: number): Promise<Campaign | null> {
		const result = await this.db.query<CampaignRow>(
			`
			UPDATE campaigns
			SET budget = $3, updated_at = NOW()
			WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
			RETURNING id, user_id, name, budget, spent, status`,
			[id, userId, budget]
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async updateNameForUser(userId: string, id: string, name: string): Promise<Campaign | null> {
		const result = await this.db.query<CampaignRow>(
			`
			UPDATE campaigns
			SET name = $3, updated_at = NOW()
			WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
			RETURNING id, user_id, name, budget, spent, status`,
			[id, userId, name]
		);

		const row = result.rows[0];

		if(!row) {
			return null;
		}

		return mapCampaignRow(row);
	}

	async archiveForUser(userId: string, id: string): Promise<boolean> {
		const result = await this.db.query(
			`
			UPDATE campaigns
			SET archived_at = NOW(), updated_at = NOW()
			WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
			RETURNING id`,
			[id, userId]
		);
		
		return result.rowCount === 1;
	}
}
import type { QueryResultRow } from "pg";
import type { Queryable } from "../db/queryable.js";
import type { Creative } from "../domain/creative.js";
import type { CreativeRepository } from "./creative.repository.js";

interface CreativeRow extends QueryResultRow {
	id: string;
	campaign_id: string;
	headline: string;
	body: string;
	destination_url: string;
}

function mapCreativeRow(row: CreativeRow): Creative {
	return {
		id: row.id,
		campaignId: row.campaign_id,
		headline: row.headline,
		body: row.body,
		destinationUrl: row.destination_url
	};
}

export class PostgresCreativeRepository implements CreativeRepository {
	constructor( private readonly db: Queryable ) {}

	async findByCampaignId(campaignId: string): Promise<Creative[]> {
		const result = await this.db.query<CreativeRow>(
			`
			SELECT id, campaign_id, headline, body, destination_url
			FROM creatives
			WHERE campaign_id = $1
			ORDER BY created_at ASC`,
			[campaignId]
		);

		return result.rows.map(mapCreativeRow);
	}

	async save(creative: Creative): Promise<Creative> {
		const result = await this.db.query<CreativeRow>(
			`
			INSERT INTO creatives (id, campaign_id, headline, body, destination_url)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, campaign_id, headline, body, destination_url`,
			[creative.id, creative.campaignId, creative.headline,
				creative.body, creative.destinationUrl
			]
		);

		const row = result.rows[0];

		if (!row) {
			throw new Error("Creative insert returned no row");
		}

		return mapCreativeRow(row)
	}
}
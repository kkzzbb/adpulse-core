import type { Queryable } from "../db/queryable.js";
import type { CampaignDevice, CampaignTargeting } from "../domain/targeting.js";
import type { TargetingRepository } from "./targeting.repository.js";

interface CampaignTargetingRow {
  campaign_id: string;
  countries: string[];
  devices: CampaignDevice[];
  age_min: number | null;
  age_max: number | null;
}

function mapTargetingRow(row: CampaignTargetingRow): CampaignTargeting {
  return {
    campaignId: row.campaign_id,
    countries: row.countries,
    devices: row.devices,
    ageMin: row.age_min,
    ageMax: row.age_max,
  };
}

export class PostgresTargetingRepository implements TargetingRepository {
  constructor(private readonly queryable: Queryable) {}

  async findByCampaignId(campaignId: string): Promise<CampaignTargeting | null> {
    const result = await this.queryable.query<CampaignTargetingRow>(
          `
            SELECT campaign_id, countries, devices, age_min, age_max
            FROM campaign_targeting
            WHERE campaign_id = $1
            LIMIT 1
          `,
          [campaignId],
        );

    const row = result.rows[0];

    return row ? mapTargetingRow(row) : null;
  }

  async upsert(targeting: CampaignTargeting): Promise<CampaignTargeting> {
    const result = await this.queryable.query<CampaignTargetingRow>(
          `
            INSERT INTO campaign_targeting (
              campaign_id, countries, devices, age_min, age_max
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (campaign_id)
            DO UPDATE SET 
							countries = EXCLUDED.countries,
              devices = EXCLUDED.devices,
              age_min = EXCLUDED.age_min,
              age_max = EXCLUDED.age_max,
              updated_at = NOW()
            RETURNING
              campaign_id, countries, devices, age_min, age_max
          `,
          [
            targeting.campaignId,
            targeting.countries,
            targeting.devices,
            targeting.ageMin,
            targeting.ageMax,
          ],
        );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Targeting upsert returned no row");
    }

    return mapTargetingRow(row);
  }
}

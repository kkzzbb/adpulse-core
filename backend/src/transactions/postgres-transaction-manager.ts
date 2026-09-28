import type { Pool } from "pg";
import { PostgresCampaignRepository } from "../repositories/postgres-campaign.repository.js";
import { PostgresCreativeRepository } from "../repositories/postgres-creative.repository.js";
import type { TransactionContext, TransactionManager } from "./transaction-manager.js";

export class PostgresTransactionManager implements TransactionManager {
	constructor( private readonly pool: Pool) {}

	async run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
		const client = await this.pool.connect();

		try {
			await client.query("BEGIN");

			const context: TransactionContext = {
				campaignRepository: new PostgresCampaignRepository(client),
				creativeRepository: new PostgresCreativeRepository(client)
			};

			const result = await work(context);

			await client.query("COMMIT");

			return result;
		} catch (error) {
			await client.query("ROLLBACK");

			throw error;
		} finally {
			client.release();
		}
	}
}
import type { Pool } from "pg";

export async function resetDatabase(pool: Pool): Promise<void> {
  const result = await pool.query<{database_name: string}>(
		`
    	SELECT current_database()
      AS database_name
    `);

		const databaseName = result.rows[0]?.database_name;
		
		if (databaseName !== "adpulse_test")
		{
			throw new Error(`Refusing to reset non-test database: ${databaseName}`);
		}
	
		await pool.query(
		`
			TRUNCATE TABLE
				user_sessions,
				campaign_targeting,
				creatives,
				campaigns,
				user_credentials,
				users
			RESTART IDENTITY
			CASCADE
		`
	);
}
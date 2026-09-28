import "dotenv/config";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { z } from "zod";

const migrationEnvSchema = z.object({
	DATABASE_URL: z.string().min(1)
});

const migrationEnv = migrationEnvSchema.parse(process.env);

const currentFilePath = fileURLToPath(import.meta.url);

const currentDirectory = path.dirname(currentFilePath);

const migrationDirectory = path.resolve(currentDirectory, "../../sql/migrations");

interface Migration {
	filename: string;
	sql: string;
	checksum: string;
}

interface AppliedMigration {
	filename: string;
	checksum: string;
}

function calculateChecksum(contents: string): string {
	return createHash("sha256").update(contents).digest("hex");
}

async function loadMigrations(): Promise<Migration[]> {
	const filenames = await readdir(migrationDirectory);

	const migrationFilenames = filenames.filter((filename) => 
		/^\d{3}_.+\.sql$/.test(filename)).sort();

	if (migrationFilenames.length === 0) {
		throw new Error("No migration files found");
	}

	return Promise.all(
		migrationFilenames.map(async (filename) => {
			const filePath = path.join(migrationDirectory, filename);
			const sql = await readFile(filePath, "utf-8");
			
			return { filename, sql, checksum: calculateChecksum(sql) };
		})
	);
}

async function main() {
	const pool = new Pool({ connectionString: migrationEnv.DATABASE_URL });

	const client = await pool.connect();

	try {
		await client.query(`
			CREATE TABLE IF NOT EXISTS schema_migrations (
				filename TEXT PRIMARY KEY,
				checksum TEXT NOT NULL,
				applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)
		`);

		const migrations = await loadMigrations();

		const appliedResult = await client.query<AppliedMigration>(`
			SELECT filename, checksum 
			FROM schema_migrations
			ORDER BY filename
		`);

		const appliedMigrations = new Map(
			appliedResult.rows.map((migration) => [
				migration.filename,
				migration.checksum
			]));

		const baselineMode = process.argv.includes("--baseline");

		if (baselineMode) {
			if (appliedMigrations.size > 0) {
				throw new Error("Cannot baseline: migration history already exists");
			}
		
			await client.query("BEGIN");
			try {
				for (const migration of migrations) {
					await client.query(
						`
						INSERT INTO schema_migrations (filename, checksum) 
						VALUES ($1, $2)
						`,
						[migration.filename, migration.checksum]
					);
					console.log(`Baselined ${migration.filename}`);
				}
				await client.query("COMMIT");
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			}

			console.log("Baseline complete");

			return ;
		}

		let appliedCount = 0;

		for (const migration of migrations) {
			const recordedChecksum = appliedMigrations.get(migration.filename);

			if (recordedChecksum) {
				if (recordedChecksum !== migration.checksum) {
					throw new Error(
						`Migration ${migration.filename} has changed after being applied`
					);
				}
				console.log(`Already applied: ${migration.filename}`);
				continue;
			}

			console.log(`Applying: ${migration.filename}`);

			await client.query("BEGIN");
			try {
				await client.query(migration.sql);
				
				await client.query(
					`
					INSERT INTO schema_migrations (filename, checksum) 
					VALUES ($1, $2)
					`,
					[migration.filename, migration.checksum]
				);

				await client.query("COMMIT");

				appliedCount++;

				console.log(`Applied: ${migration.filename}`);
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			}
		}
		
		if (appliedCount === 0) {
			console.log("No pending migrations.");
		} else {
			console.log(`Applied ${appliedCount} migration(s).`);
		}
	}
	finally {
		client.release();

		await pool.end();
	}
}

main().catch((error) => {
	console.error("Migration failed:", error);
	process.exitCode = 1;
});

import { Pool } from "pg";
import { env } from "../config/env.js";

export const pool = new Pool({
	connectionString: env.DATABASE_URL,

	max: 10,

	connectionTimeoutMillis: 2000,
});

pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error", error);
});
import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";

async function startServer() {
	await pool.query("SELECT 1");

	app.listen(env.PORT, () => {
		console.log(`AdPulse API listening on http://localhost:${env.PORT}`,);
	});
}

startServer().catch((error) => {
	console.error("Failed to start AdPulse", error);

	process.exit(1);
});
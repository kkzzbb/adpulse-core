import express from "express";
import { CampaignController } from "./controllers/campaign.controller.js";
import { errorHandler } from "./middleware/error-handler.js";
import { InMemoryCampaignRepository } from "./repositories/campaign.repository.js";
import { createCampaignRouter } from "./routes/campaign.routes.js";
import { CampaignService } from "./services/campaign.service.js";
import { pool } from "./db/pool.js";
import { PostgresCampaignRepository } from "./repositories/postgres-campaign.repository.js";
import { env } from "./config/env.js";
import { CreativeController } from "./controllers/creative.controller.js";
import { PostgresCreativeRepository } from "./repositories/postgres-creative.repository.js";
import { CreativeService } from "./services/creative.service.js";
import { PostgresTransactionManager } from "./transactions/postgres-transaction-manager.js";

export const app = express();

app.use(express.json());

const campaignRepository = new PostgresCampaignRepository(pool);
const creativeRepository = new PostgresCreativeRepository(pool);
const transactionManager = new PostgresTransactionManager(pool);

const campaignService = new CampaignService(campaignRepository, env.DEFAULT_USER_ID, transactionManager);
const creativeService = new CreativeService(campaignRepository, creativeRepository);

const campaignController = new CampaignController(campaignService);
const creativeController = new CreativeController(creativeService);



app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
	});
});

app.use(
	"/api/campaigns",
	createCampaignRouter(campaignController, creativeController)
);

app.use(
	(_req, res) => {
		res.status(404).json({
			error: "Route not found"
		});
	}
);

app.use(errorHandler);
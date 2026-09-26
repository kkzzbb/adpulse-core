import express from "express";
import { CampaignController } from "./controllers/campaign.controller.js";
import { errorHandler } from "./middleware/error-handler.js";
import { InMemoryCampaignRepository } from "./repositories/campaign.repository.js";
import { createCampaignRouter } from "./routes/campaign.routes.js";
import { CampaignService } from "./services/campaign.service.js";
import { pool } from "./db/pool.js";
import { PostgresCampaignRepository } from "./repositories/postgres-campaign.repository.js";
import { env } from "./config/env.js";

export const app = express();

app.use(express.json());

const campaignRepository = new PostgresCampaignRepository(pool);

const campaignService = new CampaignService(campaignRepository, env.DEFAULT_USER_ID);
const campaignController = new CampaignController(campaignService);

app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
	});
});

app.use(
	"/api/campaigns",
	createCampaignRouter(campaignController)
);

app.use(
	(_req, res) => {
		res.status(404).json({
			error: "Route not found"
		});
	}
);

app.use(errorHandler);
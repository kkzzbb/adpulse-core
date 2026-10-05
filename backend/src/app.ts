import express from "express";
import { CampaignController } from "./controllers/campaign.controller.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createCampaignRouter } from "./routes/campaign.routes.js";
import { CampaignService } from "./services/campaign.service.js";
import { pool } from "./db/pool.js";
import { PostgresCampaignRepository } from "./repositories/postgres-campaign.repository.js";
import { env } from "./config/env.js";
import { CreativeController } from "./controllers/creative.controller.js";
import { PostgresCreativeRepository } from "./repositories/postgres-creative.repository.js";
import { CreativeService } from "./services/creative.service.js";
import { PostgresTransactionManager } from "./transactions/postgres-transaction-manager.js";
import { createSessionMiddleware } from "./middleware/session.js";
import { Argon2PasswordHasher } from "./auth/argon2PasswordHasher.js";
import { AuthService } from "./auth/authService.js";
import { AuthController } from "./auth/authController.js";
import { PostgresAuthRepository } from "./auth/postgresAuthRepository.js";
import { createAuthRouter } from "./auth/authRoutes.js";

export const app = express();

app.use(express.json());

const campaignRepository = new PostgresCampaignRepository(pool);
const creativeRepository = new PostgresCreativeRepository(pool);
const transactionManager = new PostgresTransactionManager(pool);

const campaignService = new CampaignService(campaignRepository, env.DEFAULT_USER_ID, transactionManager);
const creativeService = new CreativeService(campaignRepository, creativeRepository);

const campaignController = new CampaignController(campaignService);
const creativeController = new CreativeController(creativeService);

const authRepository = new PostgresAuthRepository(pool);
const passwordHasher = new Argon2PasswordHasher();
const authService = new AuthService(authRepository, passwordHasher);
const authController = new AuthController(authService);

app.use(createSessionMiddleware({
	pool,
	secret: env.SESSION_SECRET,
	production: env.NODE_ENV === "production",
}));

app.use("/api/auth", createAuthRouter(authController));

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
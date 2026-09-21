import express from "express";
import type { Campaign } from "./domain/campaign.js";

const app = express();

app.use(express.json());

const PORT = 3000;

const campaigns: Campaign[] = [
	{
		id: "campaign-1",
		name: "Summer Sale",
		budget: 5000,
		spent: 1250,
		status: "ACTIVE",
	},
	{
		id: "campaign-2",
		name: "Autumn Launch",
		budget: 8000,
		spent: 0,
		status: "DRAFT",
	},
];

app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
	});
});

app.get("/api/campaigns", (_req, res) => {
	res.json(campaigns);
});

app.get("/api/campaigns/:id", (req, res) => {
  const campaign = campaigns.find((c) => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ error: "Campaign not found" });
  }
  res.json(campaign);
});

app.listen(PORT, () => {
	console.log(`AdPulse API listening on http://localhost:${PORT}`);
});
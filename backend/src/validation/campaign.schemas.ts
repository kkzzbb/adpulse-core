import { z } from "zod";
import type { CreateCampaignInput, UpdateCampaignStatusInput } from "../domain/campaign.js";

export const createCampaignSchema: z.ZodType<CreateCampaignInput> =
	z.object({
		name: z.string().trim().min(1, "Campaign name is required"),

		budget: z.number().positive("Budget must be greater than zero"),
	});

export const updateCampaignStatusSchema: 
	z.ZodType<UpdateCampaignStatusInput> =
	z.object({
		status: z.enum([
			"DRAFT",
			"ACTIVE",
			"PAUSED",
			"COMPLETED",
		]),
	}).strict();

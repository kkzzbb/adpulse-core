import { z } from "zod";
import type { CreateCampaignInput, UpdateCampaignStatusInput,
	UpdateCampaignBudgetInput,
 } from "../domain/campaign.js";

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

export const updateCampaignBudgetSchema:
	z.ZodType<UpdateCampaignBudgetInput> =
	z.object({
		budget: z.number().positive("Budget must be greater than zero"),
	}).strict();
import { z } from "zod";
import type { CreateCampaignInput, UpdateCampaignStatusInput,
	UpdateCampaignBudgetInput,UpdateCampaignInput, CreateCampaignWithCreativeInput
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

export const updateCampaignSchema:
	z.ZodType<UpdateCampaignInput> =
	z.object({
		name: z.string().trim().min(1, "Campaign name is required"),
	}).strict();

export const createCampaignWithCreativeSchema:
	z.ZodType<CreateCampaignWithCreativeInput> =
	z.object({
		name: z.string().trim().min(1, "Campaign name is required"),
		budget: z.number().positive("Budget must be greater than zero"),
		creative: z.object({
			headline: z.string().trim().min(1, "Creative headline is required"),
			body: z.string().trim().min(1, "Creative body is required"),
			destinationUrl: z.string().url("Creative destination URL must be a valid URL"),
		}),
	}).strict();
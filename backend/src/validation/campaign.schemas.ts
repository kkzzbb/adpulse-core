import { z } from "zod";
import type { CreateCampaignInput, UpdateCampaignStatusInput,
	UpdateCampaignBudgetInput,UpdateCampaignInput, CreateCampaignWithCreativeInput
 } from "../domain/campaign.js";
import { campaignDevices } from "../domain/targeting.js";

const countryCodeSchema = z.string().trim().transform((value) => 
	value.toUpperCase()).pipe(z.string().regex( /^[A-Z]{2}$/,
          "Country must be a two-letter code"),
);

export const updateCampaignTargetingSchema = z.object({
	countries: z.array(countryCodeSchema).max(50).default([]).transform(
		(countries) => [ ...new Set(countries)]),
	devices: z.array(z.enum(campaignDevices)).max(campaignDevices.length)
		.default([]).transform((devices) => [ ...new Set(devices)]),
	ageMin: z.number().int().min(13).max(100).nullable(),
	ageMax: z.number().int().min(13).max(100).nullable(),
}).superRefine((value, context) => {
	if (value.ageMin !== null && value.ageMax !== null && value.ageMin > value.ageMax) {
			context.addIssue({
				code: "custom",
				path: ["ageMax"],
				message: "Maximum age must be greater than or equal to minimum age"
		});
	}
});

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
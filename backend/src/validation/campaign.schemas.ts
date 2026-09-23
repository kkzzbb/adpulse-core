import { z } from "zod";
import type { CreateCampaignInput } from "../domain/campaign.js";

export const createCampaignSchema: z.ZodType<CreateCampaignInput> =
	z.object({
		name: z.string().trim().min(1, "Campaign name is required"),

		budget: z.number().positive("Budget must be greater than zero"),
	});
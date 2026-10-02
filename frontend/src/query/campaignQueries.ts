import { queryOptions } from "@tanstack/react-query";
import { getCampaignById, getCampaigns } from "../api/campaigns";
import { getCampaignCreatives } from "../api/creatives";
import { campaignKeys } from "./campaignKeys";

export const campaignQueries = {
  list: () => queryOptions({
      queryKey: campaignKeys.list(),
      queryFn: getCampaigns
    }),

  detail: (campaignId: string | undefined) => queryOptions({
      queryKey: campaignKeys.detail(campaignId ?? ""),
      queryFn: () => {
        if (!campaignId) {
          throw new Error("Campaign ID is missing");
        }
        return getCampaignById(campaignId);
      },
      enabled: Boolean(campaignId)
    }),

  creatives: (campaignId: string | undefined) => queryOptions({
      queryKey: campaignKeys.creatives(campaignId ?? ""),
      queryFn: () => {
        if (!campaignId) {
          throw new Error("Campaign ID is missing");
        }
        return getCampaignCreatives(campaignId);
      },
      enabled: Boolean(campaignId),
    }),
};
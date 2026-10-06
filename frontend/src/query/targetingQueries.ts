import { queryOptions } from "@tanstack/react-query";
import { getCampaignTargeting } from "../api/targeting";
import { campaignKeys } from "./campaignKeys";

export const targetingQueries = {
  detail: (campaignId: string) => queryOptions({
    queryKey: campaignKeys.targeting(campaignId),

  	queryFn: () => getCampaignTargeting(campaignId),
  })
};
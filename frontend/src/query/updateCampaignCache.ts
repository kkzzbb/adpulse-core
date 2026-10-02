import type { QueryClient } from "@tanstack/react-query";
import type { Campaign } from "../types/campaign";
import { campaignKeys } from "./campaignKeys";

export function updateCampaignCache(
  queryClient: QueryClient,
  updatedCampaign: Campaign,
) {
  queryClient.setQueryData<Campaign>(
    campaignKeys.detail(updatedCampaign.id),
    updatedCampaign,
  );

  queryClient.setQueryData<Campaign[]>(
    campaignKeys.list(),

    (currentCampaigns) => {
      if (!currentCampaigns) {
        return currentCampaigns;
      }

      return currentCampaigns.map(
        (campaign) =>
          campaign.id === updatedCampaign.id
            ? updatedCampaign
            : campaign,
      );
    },
  );
}
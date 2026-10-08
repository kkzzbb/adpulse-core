import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { campaignKeys } from "./campaignKeys";
import { clearUserScopedQueries } from "./clearUserScopedQueries";

describe("clearUserScopedQueries",
  () => {
    it("removes cached campaign data",
      async () => {
        const queryClient = new QueryClient();

        const campaignId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

        queryClient.setQueryData(campaignKeys.list(),
          [{
              id:  campaignId,
              name: "Alice Private Campaign"
          }]
        );

        queryClient.setQueryData(campaignKeys.detail(campaignId),
          {
            id: campaignId,
            name: "Alice Private Campaign",
          }
        );

        queryClient.setQueryData(campaignKeys.creatives(campaignId),
          [{
              id: "creative-1",
              headline: "Alice Creative"
          }]
        );

        expect(queryClient.getQueryData(campaignKeys.list()))
					.toBeDefined();

        await clearUserScopedQueries(queryClient);

        expect(queryClient.getQueryData(campaignKeys.list()))
					.toBeUndefined();

        expect(queryClient.getQueryData(campaignKeys.detail(campaignId)))
					.toBeUndefined();

        expect(queryClient.getQueryData(campaignKeys.creatives(campaignId)))
					.toBeUndefined();
      }
    );

		it("prevents one user's campaign cache from surviving an identity change",
  		async () => {
				const queryClient = new QueryClient();

				queryClient.setQueryData(campaignKeys.list(),
      		[{
							id: "alice-campaign",
							name: "Alice Secret Campaign"
        	}]
    		);

				expect(queryClient.getQueryData(campaignKeys.list())).toEqual([
					{
						id:	"alice-campaign",
						name:	"Alice Secret Campaign"
					}
				]);

				await clearUserScopedQueries(queryClient);

				expect(queryClient.getQueryData(campaignKeys.list()))
					.toBeUndefined();
 			}
		);
  }
);
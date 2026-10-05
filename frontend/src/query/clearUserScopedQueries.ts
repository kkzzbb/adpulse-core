import type { QueryClient } from "@tanstack/react-query";
import { campaignKeys } from "./campaignKeys";

export async function clearUserScopedQueries(queryClient: QueryClient): Promise<void> {
	await queryClient.cancelQueries({queryKey: campaignKeys.all});

  queryClient.removeQueries({queryKey: campaignKeys.all});
}
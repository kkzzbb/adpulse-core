import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/http";

function shouldRetryQuery(failureCount: number, error: Error): boolean {
	if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
		return false;
	}
	return failureCount < 1;
}

export const queryClient = new QueryClient({
	defaultOptions: { queries: { 
		staleTime: 30 * 1000,
		retry: shouldRetryQuery
	}}
});


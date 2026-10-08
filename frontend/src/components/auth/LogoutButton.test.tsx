import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { logout } from "../../api/auth";
import { campaignKeys } from "../../query/campaignKeys";
import { LogoutButton } from "./LogoutButton";
import { authKeys } from "../../query/authKeys";

vi.mock(
  "../../api/auth",
  () => ({
    logout:
      vi.fn(),
  }),
);

describe("LogoutButton",
  () => {
    beforeEach(() => {
			vi.clearAllMocks();
    });

    it("clears campaign cache and redirects to login",
      async () => {
        const user = userEvent.setup();

        vi.mocked(logout).mockResolvedValue(undefined);

        const queryClient = new QueryClient({
          defaultOptions: {
            mutations: {retry: false},
            queries: {retry: false}
          }
        });

        const campaignId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

        queryClient.setQueryData(campaignKeys.list(),
          [{
              id: campaignId,
              name: "Alice Campaign",
          }]
        );

        queryClient.setQueryData(campaignKeys.detail(campaignId),
          {
            id: campaignId,
            name: "Alice Campaign",
          }
        );

				queryClient.setQueryData(authKeys.me(),
					{
    				id: "alice-id",
						email: "alice@example.com",
						displayName: "Alice"
  				}
				);

        render(
          <QueryClientProvider
            client={queryClient}
          >
            <MemoryRouter
              initialEntries={["/private"]}
            >
              <Routes>
                <Route
                  path="/private"
                  element={<LogoutButton />}
                />

                <Route
                  path="/login"
                  element={
                    <p>
                      Login page
                    </p>
                  }
                />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>,
        );

        await user.click(screen.getByRole("button",
					{
						name: /sign out/i
					}
				));

        expect(await screen.findByText("Login page"))
					.toBeInTheDocument();


        await waitFor(
          () => {
            expect(queryClient.getQueryData(campaignKeys.list()))
							.toBeUndefined();
	          }
        );

        expect(queryClient.getQueryData(campaignKeys.detail(campaignId)))
					.toBeUndefined();

        expect(logout).toHaveBeenCalledOnce();
      }
    );
  }
);
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { getCurrentUser } from "../../api/auth";
import { RequireAuth } from "./RequireAuth";

vi.mock("../../api/auth",
  () => ({
    getCurrentUser: vi.fn(),
  }),
);

function renderProtectedRoute() {
  const queryClient = new QueryClient({defaultOptions: {
    queries: {retry: false}}
  });

  render(
    <QueryClientProvider
      client={queryClient}
    >
      <MemoryRouter
        initialEntries={["/private"]}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <p>
                Login page
              </p>
            }
          />

          <Route
            element={<RequireAuth />}
          >
            <Route
              path="/private"
              element={
                <p>
                  Private content
                </p>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("RequireAuth",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("redirects an unauthenticated user to login",
      async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        renderProtectedRoute();

        expect(await screen.findByText("Login page")).
					toBeInTheDocument();

        expect(screen.queryByText("Private content"))
					.not.toBeInTheDocument();
      }
    );

    it("renders protected content for an authenticated user",
      async () => {

        vi.mocked(getCurrentUser).mockResolvedValue({
          id: "11111111-1111-4111-8111-111111111111",
          email: "alice@example.com",
          displayName: "Alice"
        });

        renderProtectedRoute();

        expect(await screen.findByText("Private content"))
					.toBeInTheDocument();

        expect(screen.queryByText("Login page"))
					.not.toBeInTheDocument();
      }
    );
  }
);
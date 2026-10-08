import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getCampaignTargeting, updateCampaignTargeting } from "../../api/targeting";
import { renderWithQueryClient } from "../../test/renderWithQueryClient";
import { CampaignTargetingPanel } from "./CampaignTargetingPanel";

vi.mock("../../api/targeting",
  () => ({
    getCampaignTargeting: vi.fn(),

    updateCampaignTargeting: vi.fn()
  })
);

const campaignId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("CampaignTargetingPanel",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("makes targeting read-only after activation",
      async () => {
        vi.mocked(getCampaignTargeting).mockResolvedValue({
          campaignId,
          countries: ["FI"],
          devices: ["MOBILE"],
          ageMin: 18,
          ageMax: 40
        });

        renderWithQueryClient(
          <CampaignTargetingPanel
            campaignId={campaignId}
            campaignStatus= "ACTIVE"
          />
        );

        const countries = await screen.findByLabelText("Countries");

        expect(countries).toBeDisabled();

        expect(screen.queryByRole("button",
					{
						name: /save targeting/i,
					}
				)).not.toBeInTheDocument();

        expect(screen.getByText(/locked after activation/i))
					.toBeInTheDocument();
      }
    );

    it("normalizes and saves draft targeting",
      async () => {
        const user = userEvent.setup();

        vi.mocked(getCampaignTargeting).mockResolvedValue({
          campaignId,
          countries: [],
          devices: [],
          ageMin: null,
          ageMax: null,
        });

        vi.mocked(updateCampaignTargeting).mockImplementation(
          async (_campaignId, input) => ({
            campaignId,
            ...input,
          })
        );

        renderWithQueryClient(
          <CampaignTargetingPanel
            campaignId={campaignId}
            campaignStatus="DRAFT"
          />
        );

        const countries = await screen.findByLabelText("Countries");

        await user.type(countries, "fi, FI, se");

        await user.click(screen.getByRole("checkbox",
					{
             name: /mobile/i,
          }
        ));

        await user.type(screen.getByLabelText("Minimum age"), "18");

        await user.type(screen.getByLabelText("Maximum age"), "40");

        await user.click(screen.getByRole("button",
          {
            name: /save targeting/i,
          }
        ));

        await waitFor(
          () => {
            expect(updateCampaignTargeting).toHaveBeenCalledWith(campaignId,
              {
                countries: ["FI", "SE"],
                devices: ["MOBILE"],
                ageMin: 18,
                ageMax: 40,
              }
            );
          }
        );
      }
    );
  }
);
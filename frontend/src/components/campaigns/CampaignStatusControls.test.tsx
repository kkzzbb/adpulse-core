import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { updateCampaignStatus } from "../../api/campaigns";
import { renderWithQueryClient } from "../../test/renderWithQueryClient";
import type { Campaign } from "../../types/campaign";
import { CampaignStatusControls } from "./CampaignStatusControls";

vi.mock("../../api/campaigns",
  () => ({
    updateCampaignStatus: vi.fn()
  })
);

const campaign: Campaign = {
  id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",

  userId: "11111111-1111-4111-8111-111111111111",

  name: "Test Campaign",

  budget: 5000,

  spent: 0,

  status: "DRAFT"
};

describe("CampaignStatusControls",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("disables activation when no creative exists",
      () => {
        renderWithQueryClient(
          <CampaignStatusControls
            campaign={campaign}
            canActivate={false}
            activationCheckPending={false}
          />
        );

        expect(screen.getByRole("button",
            {
              name: /move to active/i,
            }
          )).toBeDisabled();

        expect(screen.getByText(/add at least one creative/i))
					.toBeInTheDocument();
      }
    );

    it("enables activation when a creative exists",
      () => {
        renderWithQueryClient(
          <CampaignStatusControls
            campaign={campaign}
            canActivate={true}
            activationCheckPending={false}
          />
        );

        expect(screen.getByRole("button",
            {
              name: /move to active/i,
            }
          )).toBeEnabled();
      }
    );

    it("requests activation when the user clicks the button",
      async () => {
        const user = userEvent.setup();

        const activeCampaign: Campaign = {
          ...campaign,
          status: "ACTIVE"
        };

        vi.mocked(updateCampaignStatus).mockResolvedValue(activeCampaign);

        renderWithQueryClient(
          <CampaignStatusControls
            campaign={campaign}
            canActivate={true}
            activationCheckPending={false}
          />
        );

        await user.click(screen.getByRole("button",
            {
              name: /move to active/i,
            }
          )
        );

        await waitFor(
          () => {
            expect(updateCampaignStatus).toHaveBeenCalledWith(
              campaign.id, "ACTIVE");
          }
        );
      }
    );
  },
);
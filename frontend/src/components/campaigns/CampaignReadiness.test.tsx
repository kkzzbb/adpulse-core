import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CampaignReadiness } from "./CampaignReadiness";

describe("CampaignReadiness",
  () => {
    it("shows that a creative is required when none exists",
      () => {
        render(
          <CampaignReadiness
            hasCreative={false}
            creativesLoading={false}
          />,
        );

        expect(screen.getByText("Required")).toBeInTheDocument();

        expect(screen.getByText(/add at least one creative/i))
          .toBeInTheDocument();
      }
    );

    it("shows creative readiness when a creative exists",
      () => {
        render(
          <CampaignReadiness
            hasCreative={true}
            creativesLoading={false}
          />
        );

        const creativeLabel = screen.getByText("Creative");

        const creativeRow = creativeLabel.closest("div");

        expect(creativeRow).not.toBeNull();

        expect(within(creativeRow!).getByText("Ready")).toBeInTheDocument();

        expect(screen.queryByText(/add at least one creative/i))
          .not.toBeInTheDocument();
      }
    );

    it("shows a checking state while creatives load",
      () => {
        render(
          <CampaignReadiness
            hasCreative={false}
            creativesLoading={true}
          />
        );

        expect(screen.getByText("Checking...")).toBeInTheDocument();
      }
    );
  }
);
import type { Campaign, CampaignStatus } from "../../types/campaign";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaignStatus } from "../../api/campaigns";
import { updateCampaignCache } from "../../query/updateCampaignCache";

interface CampaignStatusControlsProps {
	campaign: Campaign;
	canActivate: boolean;
  activationCheckPending: boolean;
}

const allowedTransitions:
	Record<CampaignStatus, CampaignStatus[]> = {
		DRAFT: ["ACTIVE"],
		ACTIVE: ["PAUSED", "COMPLETED"],
		PAUSED: ["ACTIVE", "COMPLETED"],
		COMPLETED: []
};

const statusLabels:
	Record<CampaignStatus, string> = {
		DRAFT: "Draft",
		ACTIVE: "Active",
		PAUSED: "Paused",
		COMPLETED: "Completed"
};

export function CampaignStatusControls({
	campaign,
	canActivate,
	activationCheckPending
}: CampaignStatusControlsProps) {
	const queryClient = useQueryClient();
	const updateStatusMutation = useMutation({
		mutationFn: (status: CampaignStatus) => updateCampaignStatus(campaign.id, status),
    onSuccess: (updatedCampaign) => {
			updateCampaignCache(queryClient, updatedCampaign);
    }
  });

	const nextStatuses = allowedTransitions[campaign.status];
	const canTransitionToActive = nextStatuses.includes("ACTIVE");

	function handleStatusChange(status: CampaignStatus) {
		updateStatusMutation.mutate(status);
	}

	return (
		<section>
			<h2>Campaign Status</h2>

			<p>
				Current status:{" "}
				<strong>{statusLabels[campaign.status]}</strong>
			</p>

			{nextStatuses.length === 0 ? (
				<p>
					This campaign is completed and has no further lifecycle transitions.
				</p> ) : (
					 nextStatuses.map(
          (status) => {
            const isActivating = status === "ACTIVE";
            const isDisabled = updateStatusMutation.isPending ||
              (isActivating && (activationCheckPending || !canActivate));

            return (
              <button
                className="button button--secondary"
                key={status}
                type="button"
                disabled={isDisabled}
                onClick={() => handleStatusChange(status)}
              >
                {updateStatusMutation.isPending && 
									updateStatusMutation.variables ===
                      status ? "Updating..." : `Move to ${statusLabels[status]}`}
              </button>
            );
          },
        )
      )}

      {canTransitionToActive && activationCheckPending && (
        <p
          className="form-hint"
          style={{marginTop: "0.5rem"}}
        >
          Checking activation readiness...
        </p>
      )}

      {canTransitionToActive && !activationCheckPending && !canActivate && (
        <p
          className="form-error"
          style={{marginTop: "0.5rem"}}
        >
          Add at least one creative before activating.
        </p>
      )}

      {updateStatusMutation.isError && (
        <p
          className="form-error"
          role="alert"
        >
          {updateStatusMutation.error.message}
        </p>
      )}
    </section>
  );
}
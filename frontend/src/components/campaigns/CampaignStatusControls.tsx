import type { Campaign, CampaignStatus } from "../../types/campaign";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignKeys } from "../../query/campaignKeys";
import { updateCampaignStatus } from "../../api/campaigns";

interface CampaignStatusControlsProps {
	campaign: Campaign;
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

export function CampaignStatusControls({campaign}: CampaignStatusControlsProps) {
	const queryClient = useQueryClient();
	const updateStatusMutation = useMutation({
		mutationFn: (status: CampaignStatus) =>updateCampaignStatus(campaign.id, status),
    onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({queryKey: campaignKeys.detail(campaign.id)}),
        queryClient.invalidateQueries({queryKey: campaignKeys.list()})
      ]);
    }
  });
	const nextStatuses = allowedTransitions[campaign.status];

	function handleStatusChange(status: CampaignStatus) {
		updateStatusMutation.mutate(status);
	}

	return (
		<section>
			<h2>
				Campaign Status
			</h2>

			<p>
				Current status:{" "}
				<strong>
					{statusLabels[campaign.status]}
				</strong>
			</p>

			{nextStatuses.length === 0 ? (
				<p>
					This campaign is completed and has no further lifecycle transitions.
				</p> ) : (
					nextStatuses.map((status) => (
						<button
							className="button button--secondary"
							key={status}
							type="button"
							disabled={updateStatusMutation.isPending}
							onClick={() => handleStatusChange(status)}
						>
							{updateStatusMutation.isPending &&
							updateStatusMutation.variables === status 
							? "Updating..." : `Move to ${statusLabels[status]}`}
						</button>
					))
				)}

			{updateStatusMutation.isError && (<p className="form-error" role="alert">
          {updateStatusMutation.error.message}</p>)}
		</section>
	);
}
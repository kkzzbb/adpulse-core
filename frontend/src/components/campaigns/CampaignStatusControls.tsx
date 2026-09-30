import { useState } from "react";
import { updateCampaignStatus } from "../../api/campaigns";
import type { Campaign, CampaignStatus } from "../../types/campaign";

interface CampaignStatusControlsProps {
	campaign: Campaign;

	onCampaignUpdated: (campaign: Campaign) => void;
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

export function CampaignStatusControls({campaign, onCampaignUpdated}: CampaignStatusControlsProps) {
	const [submittingStatus, setSubmittingStatus] = useState<CampaignStatus | null>(null);
	const [error, setError] = useState<string | null>(null);
	const nextStatuses = allowedTransitions[campaign.status];

	async function handleStatusChange(status: CampaignStatus) {
		setSubmittingStatus(status);
		setError(null);

		try {
			const updatedCampaign = await updateCampaignStatus(campaign.id, status);
			
			onCampaignUpdated(updatedCampaign);
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occured");
			}
		} finally {
			setSubmittingStatus(null);
		}
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
							key={status}
							type="button"
							disabled={submittingStatus !== null}
							onClick={() => handleStatusChange(status)}
						>
							{submittingStatus === status ? "Updating..." : `Move to ${statusLabels[status]}`}
						</button>
					))
				)}

				{error && (<p className="form-error"role="alert">{error}</p>)}
		</section>
	);
}
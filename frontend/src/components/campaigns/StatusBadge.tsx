import type { CampaignStatus } from "../../types/campaign";

interface StatusBadgeProps {
	status: CampaignStatus;
}

const statusLabels: Record<CampaignStatus, string> = {
	DRAFT: "Draft",
	ACTIVE: "Active",
	PAUSED: "Paused",
	COMPLETED: "Completed"
};

export function StatusBadge({status}: StatusBadgeProps) {
	return (
		<span className={`status-badge status-badge--${status.toLowerCase()}`}>
			{statusLabels[status]}
		</span>
	)
}
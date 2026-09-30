import { useState } from "react";
import { archiveCampaign } from "../../api/campaigns";
import type { Campaign } from "../../types/campaign";

interface ArchiveCampaignButtonProps {
	campaign: Campaign;

	onArchived: () => void;
}

export function ArchiveCampaignButton({campaign, onArchived}: ArchiveCampaignButtonProps) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const archiveBlocked = campaign.status === "ACTIVE";

	async function handleArchive() {
		const confirmed = window.confirm(`Archive "${campaign.name}"?`);

		if (!confirmed) {
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			await archiveCampaign(campaign.id);

			onArchived();
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occured");
			}
		} finally {
			setSubmitting(false);
		}
	}
	
	return (
		<section>
			<h2>
				Archive
			</h2>

			{archiveBlocked && (
				<p>Active campaigns must be paused or completed 
					before they can be archived.</p>)}
			
			<button
				type="button"
				disabled={archiveBlocked || submitting}
				onClick={handleArchive}
			>
				{submitting? "Archiving..." : "Archive campaign"}
			</button>

			{error && (<p>{error}</p>)}
		</section>
	);
}
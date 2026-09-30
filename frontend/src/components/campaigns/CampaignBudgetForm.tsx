import React, { useEffect, useState } from  "react";
import { updateCampaignBudget } from "../../api/campaigns";
import type { Campaign } from "../../types/campaign";

interface CampaignBudgetFormProps {
	campaign: Campaign;
	disabled?: boolean;
	onCampaignUpdated: (campaign: Campaign) => void;
}

export function CampaignBudgetForm({
	campaign,
	disabled = false,
	onCampaignUpdated
}: CampaignBudgetFormProps) {
	const [budget, setBudget] = useState(String(campaign.budget));
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setBudget(String(campaign.budget));
	}, [campaign.budget]);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const numericBudget = Number(budget)

		if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
			setError("Budget must be greater than zero");

			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			const updatedCampaign = await updateCampaignBudget(campaign.id, numericBudget);
			onCampaignUpdated(updatedCampaign);
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
		<form onSubmit={handleSubmit}>
			<h2>
				Budget
			</h2>

			<label>
				Budget (€)
				<input
					type="number"
					min="0"
					step="0.01"
					value={budget}
					disabled={disabled || submitting}
					onChange={(event) => setBudget(event.target.value)}
				/>
			</label>

			<button
				type="submit"
				disabled={disabled || submitting}
			>
				{submitting ? "Saving..." : "Update budget"}
			</button>

			{error &&(<p>{error}</p>)}
		</form>
	);
}
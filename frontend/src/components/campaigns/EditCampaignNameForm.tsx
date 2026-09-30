import React, { useEffect, useState } from "react";
import { updateCampaignName } from "../../api/campaigns";
import type { Campaign } from "../../types/campaign";


interface EditCampaignNameFormProps {
	campaign: Campaign;
	disabled?: boolean;
	onCampaignUpdated: (campaign: Campaign) => void;
}

export function EditCampaignNameForm({
	campaign, disabled = false, onCampaignUpdated
}: EditCampaignNameFormProps) {
	const [name, setName] = useState(campaign.name);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
		setName(campaign.name);
	}, [campaign.name]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
				event.preventDefault();

				const trimmedName = name.trim();

				if (!trimmedName) {
					setError("Campaign name is required");

					return;
				}

				setSubmitting(true);
				setError(null);

				try {
					const updatedCampaign = await updateCampaignName(campaign.id, trimmedName);

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
						Edit campaign
					</h2>

					<label>
						Name
						<input
							type="text"
							value={name}
							disabled={disabled || submitting}
							onChange={(event) => setName(event.target.value)}
						/>
					</label>

					<button
						type="submit"
						disabled={disabled || submitting}
					>
						{submitting ? "Saving..." : "Save name"}
					</button>

					{error && (<p className="form-error"role="alert">{error}</p>)}
				</form>
			);
}
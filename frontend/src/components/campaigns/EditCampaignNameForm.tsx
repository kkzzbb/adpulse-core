import React, { useEffect, useState } from "react";
import { updateCampaignName } from "../../api/campaigns";
import type { Campaign } from "../../types/campaign";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaignCache } from "../../query/updateCampaignCache";

interface EditCampaignNameFormProps {
	campaign: Campaign;
	disabled?: boolean;
}

export function EditCampaignNameForm({campaign, disabled = false}: EditCampaignNameFormProps) {
	const queryClient = useQueryClient();
	const [name, setName] = useState(campaign.name);
	const [validationError, setValidationError] = useState<string | null>(null);

	const updateNameMutation = useMutation({
		mutationFn: (newName: string) => updateCampaignName(campaign.id, newName),
		onSuccess: (updatedCampaign)=> {
			updateCampaignCache(queryClient, updatedCampaign);
		} 
	});
	
	useEffect(() => {
		setName(campaign.name);
	}, [campaign.name]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const trimmedName = name.trim();

		if (!trimmedName) {
			setValidationError("Campaign name is required");
			return;
		}

		setValidationError(null);

		updateNameMutation.mutate(trimmedName);
	}
	
	return (
		<form onSubmit={handleSubmit}>
			<h2>
				Edit campaign
			</h2>

			<label>
				Name
				<input
					id="campaign-edit-name"
					type="text"
					value={name}
					disabled={disabled || updateNameMutation.isPending}
					onChange={(event) => setName(event.target.value)}
				/>
			</label>

			{validationError && (<p className="form-error"role="alert">{validationError}</p>)}
			
			{updateNameMutation.isError && (
				<p className="form-error"role="alert">{updateNameMutation.error.message}</p>)}
			
			<button
				className="button button--primary"
				type="submit"
				disabled={disabled || updateNameMutation.isPending}
			>
				{updateNameMutation.isPending ? "Saving..." : "Save name"}
			</button>
		</form>
		);
}
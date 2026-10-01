import React, { useEffect, useState } from  "react";
import { updateCampaignBudget } from "../../api/campaigns";
import type { Campaign } from "../../types/campaign";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignKeys } from "../../query/campaignKeys";

interface CampaignBudgetFormProps {
	campaign: Campaign;
	disabled?: boolean;
}

export function CampaignBudgetForm({campaign,	disabled = false}: CampaignBudgetFormProps) {
	const queryClient = useQueryClient();
	const [budget, setBudget] = useState(String(campaign.budget));
	const [validationError, setValidationError] = useState<string | null>(null);

	const updateBudgetMutation = useMutation({
		mutationFn: (newBudget: number) =>  updateCampaignBudget(campaign.id, newBudget),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({queryKey: campaignKeys.detail(campaign.id)}),
				queryClient.invalidateQueries({queryKey: campaignKeys.list()})
			]);
		}
	});


	useEffect(() => {
		setBudget(String(campaign.budget));
	}, [campaign.budget]);

	function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const numericBudget = Number(budget)

		if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
			setValidationError("Budget must be greater than zero");
			return;
		}

		setValidationError(null);

		updateBudgetMutation.mutate(numericBudget);
	}	
	
	return (
		<form onSubmit={handleSubmit}>
			<h2>
				Budget
			</h2>

			<label htmlFor="campaign-budget">
				Budget (€)
			</label>

			<input
				id="campaign-budget"
				type="number"
				min="0.01"
				step="0.01"
				value={budget}
				disabled={disabled || updateBudgetMutation.isPending}
				onChange={(event) => setBudget(event.target.value)}
			/>

			{validationError && (<p className="form-error" role="alert">{validationError}</p>)}
			
			{updateBudgetMutation.isError && (<p className="form-error" role="alert">{updateBudgetMutation.error.message}</p>)}
			
			<button
				className="button button--primary"
				type="submit"
				disabled={disabled || updateBudgetMutation.isPending}
			>
				{updateBudgetMutation.isPending ? "Saving..." : "Update budget"}
			</button>
		</form>
	);
}
import { useState } from "react";
import { createCampaign } from "../../api/campaigns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignKeys } from "../../query/campaignKeys";

export function CreateCampaignForm() {
  const queryClient = useQueryClient();
	const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
	
	const createCampaignMutation = useMutation({
		mutationFn: createCampaign,
		onSuccess: async () => {
			await queryClient.invalidateQueries({queryKey: campaignKeys.list()});
			setName("");
			setBudget("");
			setValidationError(null);
		}
	});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) 
	{
		event.preventDefault();
		
		const trimmedName = name.trim();
    const numericBudget = Number(budget);

    if (!trimmedName) {
      setValidationError("Campaign name is required");
      return;
    }

    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      setValidationError("Budget must be greater than zero");
      return;
    }

		setValidationError(null);

		createCampaignMutation.mutate({
			name: trimmedName,
			budget: numericBudget
		});
	}

  return (
	<form onSubmit={handleSubmit}>
	  <h2>Create Campaign</h2>
	  <div>
		<label htmlFor="campaign-name">
			Name
		</label>
		<input
		  id="campaign-name"
		  type="text"
		  value={name}
			disabled={createCampaignMutation.isPending}
		  onChange={(event) => {setName(event.target.value);}}
		/>
	  </div>
	  <div>
			<label htmlFor="campaign-budget">
				Budget
			</label>
			<input
				id="campaign-budget"
				type="number"
				min="1"
				value={budget}
				disabled={createCampaignMutation.isPending}
				onChange={(event) => {setBudget(event.target.value);}}
			/>
	  </div>

	  {validationError && (<p className="form-error"role="alert">{validationError}</p>)}

		{createCampaignMutation.isError && (<p className="form-error"role="alert">
			{createCampaignMutation.error.message}</p>)}

	  <button 
			className="button button--primary"
	  	type="submit"
			disabled={createCampaignMutation.isPending}
	  >
			{createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
	  </button>
	</form>
  );
}
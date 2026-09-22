import { useState } from "react";
import { createCampaign } from "../api/campaigns.ts";
import type { Campaign } from "../types/campaign.ts";

interface CreateCampaignFormProps {
  onCampaignCreated: (campaign: Campaign) => void;
}

export function CreateCampaignForm({
  onCampaignCreated,
}: CreateCampaignFormProps) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
	event: React.FormEvent<HTMLFormElement>,
  ) {
	event.preventDefault();

	setSubmitting(true);
	setError(null);

	try {
	  const campaign = await createCampaign({
		name,
		budget: Number(budget),
	  });

	  onCampaignCreated(campaign);
	  setName("");
	  setBudget("");
	} catch (error: unknown) {
		if (error instanceof Error) {
			setError(error.message);
		} else {
			setError("An unknown error occurred");
		}
	} finally {
		setSubmitting(false);
	}
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
		  onChange={(event) => {
			setName(event.target.value);
		  }}
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
		  onChange={(event) => {
			setBudget(event.target.value);
		  }}
		  value={budget}
		/>
	  </div>

	  {error && <p>Error: {error}</p>}

	  <button
	  	type="submit"
		disabled={submitting}
	  >
		{submitting ? "Creating..." : "Create Campaign"}
	  </button>
	</form>
  );
}
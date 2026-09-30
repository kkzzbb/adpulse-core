import { useEffect, useState } from "react";
import { getCampaigns } from "../api/campaigns";
import type { Campaign } from "../types/campaign";
import { CampaignCard } from "../components/campaigns/CampaignCard";
import { CreateCampaignForm } from "../components/campaigns/CreateCampaignForm";

export function CampaignListPage() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadCampaigns() {
			try {
				const data = await getCampaigns();

				if (!cancelled) {
					setCampaigns(data);
				}
			} catch (error: unknown) {
				if (cancelled) {
					return;
				}

				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("An unknown error occurred");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadCampaigns();

		return () => { cancelled = true; };
	}, []);
	
	function handleCampaignCreated(campaign: Campaign) {
		setCampaigns((currentCampaigns) => [campaign, ...currentCampaigns]);
	}

	return (
		<section>
			<h1>Campaigns</h1>

			<CreateCampaignForm onCampaignCreated={handleCampaignCreated} />

			<h2>Your campaigns</h2>

			{loading && (<p>Loading campaigns...</p>)}

			{error && (<p>Error: {error}</p>)}

			{!loading && !error && campaigns.length === 0 && (
				<p>No campaigns yet.</p>)}

			{!loading && !error && campaigns.map((campaign) => (
				<CampaignCard key={campaign.id} campaign={campaign} />
			))}	
		</section>
		);
}

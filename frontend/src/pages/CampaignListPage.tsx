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
		<div className="page-stack">
			<header className="page-heading">
				<div>
					<p className="eyebrow">
						Campaign workspace
					</p>
		
					<h1>Campaigns</h1>

					<p className="page-description">
						Create campaigns, manage budgets, and control campaign delivery.
					</p>
				</div>
			</header>

			<section className="panel">
				<CreateCampaignForm onCampaignCreated={handleCampaignCreated} />
			</section>

			<section>
				<div className="section-heading">
					<h2>Your campaigns</h2>

					{!loading && !error && (<span className="item-count">
						{campaigns.length}{" "}campaigns
					</span>)}
				</div>

			{loading && (<div className="page-state">
				<p>Loading campaigns...</p>
				</div>)}

			{error && (<div className="page-state page-state--error"role="alert">
				<strong>
					Could not load campaigns
				</strong>
				
				<p>Error: {error}</p>
			</div>)}

			{!loading && !error && campaigns.length === 0 && (
				<div className="page-state">
					<strong>
						No campaigns yet
					</strong>
					
					<p> Create your first campaign above.</p>
				</div>)}

			{!loading && !error && campaigns.length > 0 && (
				<div className="campaign-grid">
					{campaigns.map((campaign) => (
				<CampaignCard key={campaign.id} campaign={campaign} />
				))}
				</div>
			)}
		</section>
		</div>
		);
}

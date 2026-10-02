import { CampaignCard } from "../components/campaigns/CampaignCard";
import { CreateCampaignForm } from "../components/campaigns/CreateCampaignForm";
import { useQuery } from "@tanstack/react-query";
import { campaignQueries } from "../query/campaignQueries";

export function CampaignListPage() {
	const campaignsQuery = useQuery(campaignQueries.list());

	const campaigns = campaignsQuery.data ?? [];

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
				<CreateCampaignForm />
			</section>

			<section>
				<div className="section-heading">
					<h2>Your campaigns</h2>

					{campaignsQuery.isSuccess && (<span className="item-count">
						{campaigns.length}{" "}campaigns
					</span>)}
					
					{campaignsQuery.isFetching && !campaignsQuery.isPending && (
            <span className="item-count">
              Refreshing...
            </span>
          )}
				</div>

			{campaignsQuery.isPending && (<div className="page-state">
				<p>Loading campaigns...</p>
				</div>)}

			{campaignsQuery.isError && (<div className="page-state page-state--error"role="alert">
				<strong>
					Could not load campaigns
				</strong>
				
				<p>Error: {campaignsQuery.error.message}</p>
			</div>)}

			{campaignsQuery.isSuccess && campaigns.length === 0 && (
				<div className="page-state">
					<strong>
						No campaigns yet
					</strong>
					
					<p> Create your first campaign above.</p>
				</div>)}

			{campaignsQuery.isSuccess && campaigns.length > 0 && (
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

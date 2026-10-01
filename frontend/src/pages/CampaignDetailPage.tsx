import { Link, useParams } from "react-router";
import { getCampaignById } from "../api/campaigns";
import { getCampaignCreatives } from "../api/creatives";
import { ArchiveCampaignButton } from "../components/campaigns/ArchiveCampaignButton";
import { CampaignBudgetForm } from "../components/campaigns/CampaignBudgetForm";
import { CampaignStatusControls } from "../components/campaigns/CampaignStatusControls";
import { EditCampaignNameForm } from "../components/campaigns/EditCampaignNameForm";
import { CreateCreativeForm } from "../components/campaigns/CreateCreativeForm";
import { CreativeCard } from "../components/campaigns/CreativeCard";
import { StatusBadge } from "../components/campaigns/StatusBadge";
import { formatCurrency } from "../utils/format";
import { useQuery } from "@tanstack/react-query";
import { campaignKeys } from "../query/campaignKeys";

export function CampaignDetailPage() {
	const {campaignId} = useParams();
	const campaignQuery = useQuery({
		queryKey: campaignKeys.detail(campaignId ?? ""),
		queryFn: () => {
			if (!campaignId) {
				throw new Error("Campaign ID is missing");
			}
			return getCampaignById(campaignId);
		},
		enabled: Boolean(campaignId)
		});
	const creativesQuery = useQuery({
		queryKey: campaignKeys.creatives(campaignId ?? ""),
		queryFn: () => {
			if (!campaignId) {
				throw new Error("Campaign ID is missing");
			}
			return getCampaignCreatives(campaignId);
		},
		enabled: Boolean(campaignId)
	});

	if (!campaignId) {
		return (
			<div className="page-state page-state--error" role="alert">
				Campaign ID is missing.
			</div>
		);
	}
	
	const isPending = campaignQuery.isPending || creativesQuery.isPending;

	if (isPending) {
		return (
			<div className="page-state">
				<p>
					Loading campaign...
				</p>
			</div>
		);
	}

	const queryError = campaignQuery.error ?? creativesQuery.error;

	if (queryError) {
		return (
			<div className="page-state page-state--error" role="alert">
				<strong>
					Could not load campaign
				</strong>
				<p>
					{queryError.message}
				</p>
				<Link className="text-link" to="/">
					← Back to campaigns
				</Link>
			</div>
		);
	}

	const campaign = campaignQuery.data;
	const creatives = creativesQuery.data ?? [];

	if (!campaign) {
		return (
			<div className="page-state">
				Camapgin not found.
			</div>
		);
	}

	return (
		<div className="page-stack">
			<Link className="text-link" to ="/">
				 ← Back to campaigns
			</Link>

			<header className="campaign-hero">
				<div>
					<p className="eyebrow">
						Campaign
					</p>
					
					<h1>{campaign.name}</h1>

					<StatusBadge status={campaign.status}/>
				</div>

				<div className="metric-grid">
					<div className="metric-card">
						<span className="metric-label">
							Budget
						</span>

						<strong>
							{formatCurrency(campaign.budget)}
						</strong>
					</div>

					<div className="metric-card">
						<span className="metric-label">
							Spent
						</span>

						<strong>
							{formatCurrency(campaign.spent)}
						</strong>
					</div>

					<div className="metric-card">
						<span className="metric-label">
							Remaining
						</span>

						<strong>
							{formatCurrency(campaign.budget - campaign.spent)}
						</strong>
					</div>
				</div>
			</header>	

			{campaign.status === "COMPLETED" && (
				<div className="notice">
					This campaign is completed. Campaign metadata and budget are now read-only.
				</div>
				)}

				<div className="action-grid">
					<EditCampaignNameForm
						campaign={campaign}
						disabled={campaign.status === "COMPLETED"}
					/>

					<CampaignBudgetForm
						campaign={campaign}
						disabled={campaign.status === "COMPLETED"}
					/>

					<CampaignStatusControls
						campaign={campaign}
					/>

					<ArchiveCampaignButton
						campaign={campaign}
					/>
				</div>

				<section className="panel">
					<div className="section-heading">
						<h2>Creatives</h2>

						<span className="item-count">
							{creatives.length}{" "}
							creatives
						</span>
					</div>

					{campaign.status === "DRAFT" ? (
						<CreateCreativeForm campaignId={campaign.id}/>
					) : (
						<div className="notice">
							New creatives can only be added while the campign is in Draft status.
						</div>
					)}

					{creatives.length === 0 ? (
						<div className="empty-state">
							<strong>
								No creatives yet
							</strong>
							
							<p>
								Add the first creative while this campaign is still in Draft
							</p>
						</div>) : (
						<div className="creative-grid">	
							{creatives.map((creative) => (
								<CreativeCard
									key={creative.id}
									creative={creative}/>
							)
						)}
						</div>
				)}
			</section>
		</div>	
	);
}
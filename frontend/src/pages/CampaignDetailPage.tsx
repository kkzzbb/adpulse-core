import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { getCampaignById } from "../api/campaigns";
import { getCampaignCreatives } from "../api/creatives";
import type { Campaign } from "../types/campaign";
import type { Creative } from "../types/creative";
import { ArchiveCampaignButton } from "../components/campaigns/ArchivedCampaignButton";
import { CampaignBudgetForm } from "../components/campaigns/CampaignBudgetForm";
import { CampaignStatusControls } from "../components/campaigns/CampaignStatusControls";
import { EditCampaignNameForm } from "../components/campaigns/EditCampaignNameForm";
import { CreateCreativeForm } from "../components/campaigns/CreateCreativeForm";
import { CreativeCard } from "../components/campaigns/CreativeCard";
import { StatusBadge } from "../components/campaigns/StatusBadge";
import { formatCurrency } from "../utils/format";

export function CampaignDetailPage() {
	const navigate = useNavigate();
	const {campaignId} = useParams();
	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [creatives, setCreatives] = useState<Creative[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	function handleCampaignUpdated(updatedCampaign: Campaign) {
		setCampaign(updatedCampaign);
	}

	function handleArchived() {
		navigate("/");
	}

	function handleCreativeCreated(creative: Creative) {
		setCreatives((currentCreatives) => [...currentCreatives, creative]);
	}

	useEffect(() => {
		if (!campaignId) {
			setError("Campaign ID is missing");
			setLoading(false);
			return;
		}

		let cancelled = false;

		async function loadCampaign() {
			try {
				const [campaignData, creativeData] = await Promise.all([
					getCampaignById(campaignId!),
					getCampaignCreatives(campaignId!),
				]);

				if (cancelled) {
					return;
				}

				setCampaign(campaignData);
				setCreatives(creativeData);
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

		loadCampaign();

		return () => { cancelled = true; };
	}, [campaignId]);

	if (loading) {
		return (
			<div className="page-state">
				<p>Loading campaign details...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="page-state page-state--error"role="alert">
				<strong>
					Could not load campaign
				</strong>

				<p>{error}</p>

				<Link className="text-link"to="/">
					← Back to campaigns
				</Link>
			</div>
		);
	}

	if (!campaign) {
		return (
			<p>Campaign not found.</p>
		);
	}

	return (
		<div className="page-stack">
			<Link className="text-link"to ="/">
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
						onCampaignUpdated={handleCampaignUpdated}
					/>

					<CampaignBudgetForm
						campaign={campaign}
						disabled={campaign.status === "COMPLETED"}
						onCampaignUpdated={handleCampaignUpdated}
					/>

					<CampaignStatusControls
						campaign={campaign}
						onCampaignUpdated={handleCampaignUpdated}
					/>

					<ArchiveCampaignButton
						campaign={campaign}
						onArchived={handleArchived}
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
						<CreateCreativeForm campaignId={campaign.id} onCreativeCreated={handleCreativeCreated}/>
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
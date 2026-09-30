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
		return <p>Loading campaign details...</p>;
	}

	if (error) {
		return (
			<section>
				<p>Error: {error}</p>

				<Link to="/">Back to Campaigns</Link>
			</section>
		);
	}

	if (!campaign) {
		return (
			<p>Campaign not found.</p>
		);
	}

	return (
		<section>
			<Link to ="/">
				 ← Back to campaigns
			</Link>

			<h1>{campaign.name}</h1>

			<p>Status: {campaign.status}</p>
			<p>Budget: €{campaign.budget}</p>
			<p>Spent: €{campaign.spent}</p>

			{campaign.status === "COMPLETED" && (<p>
				This campaign is completed. Campaign metadata and budget are now read-only.
			</p>)}

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
			
			<h2>Creatives</h2>

			{campaign.status === "DRAFT" ? (
				<CreateCreativeForm campaignId={campaign.id} onCreativeCreated={handleCreativeCreated}/>
			) : (
				<p>New creatives can only be added while the campign is in Draft status.</p>
			)}

			{creatives.length === 0 ? (
    		<p>No creatives yet.</p>) : (
				creatives.map((creative) => (
					<CreativeCard
						key={creative.id}
						creative={creative}/>
				)
			)
		)}
		</section>
	);
}
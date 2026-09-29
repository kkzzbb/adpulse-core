import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getCampaignById } from "../api/campaigns.ts";
import { getCampaignCreatives } from "../api/creatives.ts";
import type { Campaign } from "../types/campaign.ts";
import type { Creative } from "../types/creative.ts";

export function CampaignDetailPage() {
	const {campaignId} = useParams();
	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [creatives, setCreatives] = useState<Creative[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

			<h2>Creatives</h2>

			{creatives.length === 0 ? (
				<p>No creatives yet.</p>
			) : (
				creatives.map((creative) => (
					<article key={creative.id}>

						<h3>{creative.headline}</h3>

						<p>{creative.body}</p>

						<a 
						href={creative.destinationUrl}
						target="_blank"
						rel="noreferrer"
						>
						Destination</a>
					</article>
				)
			)
		)}
		</section>
	);
}
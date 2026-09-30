import { Link } from "react-router";
import type { Campaign } from "../../types/campaign";

interface CampaignCardProps {
	campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
	return (
		<article>
			<h3>
				<Link to={`/campaigns/${campaign.id}`}>
					{campaign.name}
				</Link>
			</h3>
			<p>
				Status: {campaign.status}
			</p>

			<p>
				Budget: {campaign.budget}
			</p>

			<p>
				Spent: {campaign.spent}
			</p>
		</article>
	);
}
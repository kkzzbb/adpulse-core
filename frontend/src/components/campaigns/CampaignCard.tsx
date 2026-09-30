import { Link } from "react-router";
import type { Campaign } from "../../types/campaign";
import { formatCurrency } from "../../utils/format";
import { StatusBadge } from "./StatusBadge";

interface CampaignCardProps {
	campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
	const spendPercentage = campaign.budget > 0 ? Math.min(
		(campaign.spent / campaign.budget) * 100, 100) : 0;
	
	return (
		<article className="campaign-card">
			<div className="campaign-card__header">
				<div>
					<h3>
						{campaign.name}
					</h3>

					<StatusBadge status={campaign.status}/>
				</div>
			</div>

			<div className="campaign-card__metrics">
				<span className="metric-label">
					Budget
				</span>

				<span className="metric-label">
					Spent
				</span>
				
				<strong>
					{formatCurrency(campaign.budget)}
				</strong>
				
				<strong>
					{formatCurrency(campaign.spent)}
				</strong>
			</div>

			<div
				className="spend-progress"
				aria-label="Budget spent"
			>
				<div
					className="spend-progress__bar"
					style={{width:`${spendPercentage}%`}}
				/>
			</div>
				<Link
					className="text-link"
					to={`/campaigns/${campaign.id}`}
				>
					View campaign → 	
				</Link>
		</article>
	);
}
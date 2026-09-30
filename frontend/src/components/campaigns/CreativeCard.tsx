import type { Creative } from "../../types/creative";

interface CreativeCardProps {
	creative: Creative;
}

export function CreativeCard({creative}: CreativeCardProps) {
	return (
		<article className="creative-card">
			<div>
				<span className="creative-card__label">
					Creative
				</span>
			
				<h3>
					{creative.headline}
				</h3>
			</div>

			<p>
				{creative.body}
			</p>

			<a 
				className="text-link"
				href={creative.destinationUrl}
				target="_blank"
				rel="noreferrer"
			>
				Visit destination ↗
			</a>
		</article>
	);
}
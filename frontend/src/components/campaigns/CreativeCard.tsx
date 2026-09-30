import type { Creative } from "../../types/creative";

interface CreativeCardProps {
	creative: Creative;
}

export function CreativeCard({creative}: CreativeCardProps) {
	return (
		<article>
			<h3>
				{creative.headline}
			</h3>

			<p>
				{creative.body}
			</p>

			<a href={creative.destinationUrl}
			target="_blank"
			rel="noreferrer">
				Visit destination
			</a>
		</article>
	);
}
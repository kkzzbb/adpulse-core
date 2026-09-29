import { Link } from "react-router";

export function NotFoundPage() {
	return (
		<section>
			<h1>Page Not Found</h1>

			<p>The page you are looking for does not exist.</p>
			<p>
				<Link to="/">Back to Campaigns</Link>
			</p>
		</section>
	);
}
import { NavLink, Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "../../query/authQueries";
import { LogoutButton } from "../auth/LogoutButton";

export function AppLayout() {
	const authQuery = useQuery(authQueries.me());
	const user = authQuery.data;

	return (
		<div className="app-shell">
			<header className="app-header">
				<div className="app-header__inner">
					<NavLink className="brand" to="/">
						AdPulse
					</NavLink>
				
					<span className="brand-subtitle">
						Campaign management
					</span>
				</div>

				<div className="app-header__account">
					{user && (
						<div>
							<strong>
								{user.displayName}
							</strong>

							<span>
								{user.email}
							</span>
						</div>
					)}

					<LogoutButton />
				</div>
			</header>
			
			<main className="page-container">
				<Outlet />
			</main>
		</div>
	);
}
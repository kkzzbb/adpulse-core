import { NavLink, Outlet } from "react-router";

export function AppLayout() {
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
			</header>
			
			<main className="page-container">
				<Outlet />
			</main>
		</div>
	);
}
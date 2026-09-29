import { NavLink, Outlet } from "react-router";

export function AppLayout() {
	return (
		<>
			<header>
				<nav>
					<NavLink to="/">
						AdPulse
					</NavLink>
				</nav>
			</header>
			
			<main>
				<Outlet />
			</main>
		</>
	);
}
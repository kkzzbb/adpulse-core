import { Navigate, Outlet, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "../../query/authQueries";

export function RequireAuth() {
  const location = useLocation();

	const authQuery = useQuery(authQueries.me());

  if (authQuery.isPending) {
    return (
      <div className="page-state">
        <p>
          Checking your session...
        </p>
      </div>
    );
  }

  if (authQuery.isError) {
    return (
      <div className="page-state page-state--error" role="alert">
        <strong>
          Could not verify your session
        </strong>

        <p>{authQuery.error.message}</p>

        <button 
					className="button button--primary"
          type="button"
          onClick={() => {void authQuery.refetch();}}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!authQuery.data) {
    const from = location.pathname + location.search;

    return (
      <Navigate 
				to="/login" 
				replace 
				state={{from}}
			/>
    );
  }

  return <Outlet />;
}
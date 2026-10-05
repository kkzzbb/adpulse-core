import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../../api/auth";
import { authKeys } from "../../query/authKeys";
import { clearUserScopedQueries } from "../../query/clearUserScopedQueries";
import type { AuthUser } from "../../types/auth";

export function LogoutButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: async () => {
      await clearUserScopedQueries(queryClient);  
      queryClient.setQueryData<AuthUser | null>(authKeys.me(), null);
			navigate("/login", {replace: true});
    },
  });

  return (
    <>
      <button
        className="button button--secondary"
        type="button"
        disabled={logoutMutation.isPending}
        onClick={() => {logoutMutation.mutate();}}
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign out"}
      </button>

      {logoutMutation.isError && (
        <p
          className="form-error"
          role="alert"
        >
          {logoutMutation.error.message}
        </p>
      )}
    </>
  );
}
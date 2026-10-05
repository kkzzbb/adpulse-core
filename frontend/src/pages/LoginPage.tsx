import { useState } from "react";
import { Link, useLocation, useNavigate} from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/auth";
import { authKeys } from "../query/authKeys";
import { clearUserScopedQueries } from "../query/clearUserScopedQueries";
import type { AuthUser } from "../types/auth";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const loginMutation = useMutation(
		{
			mutationFn: login,
      onSuccess: async (user: AuthUser) => {
				await clearUserScopedQueries(queryClient);
        queryClient.setQueryData<AuthUser | null>(authKeys.me(), user);
        const state = location.state as | LoginLocationState | null;
        const destination = state?.from ?? "/";
        navigate(destination, {replace: true});
      },
    });

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setValidationError("Email is required");
      return;
    }

    if (!password) {
      setValidationError("Password is required");
      return;
    }

    setValidationError(null);

    loginMutation.mutate({
      email: normalizedEmail,
      password,
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">
          AdPulse
        </p>

        <h1>
          Sign in
        </h1>

        <p>
          Sign in to manage your advertising campaigns.
        </p>


        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={loginMutation.isPending}
            onChange={(event) => {setEmail(event.target.value);}}
          />

          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={loginMutation.isPending}
            onChange={(event) => {setPassword(event.target.value);}}
          />

          {validationError && (
						<p className="form-error" role="alert">
              {validationError}
            </p>
          )}

          {loginMutation.isError && (
            <p className="form-error" role="alert">
              {loginMutation.error.message}
            </p>
          )}

          <button
            className="button button--primary"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p> No account?{" "}
          <Link
            to="/register"
            className="text-link"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
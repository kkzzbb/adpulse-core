import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "../api/auth";
import { authKeys } from "../query/authKeys";
import { clearUserScopedQueries } from "../query/clearUserScopedQueries";
import type { AuthUser } from "../types/auth";

export function RegisterPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const registerMutation = useMutation({
      mutationFn:register,

      onSuccess: async (user: AuthUser) => {
        await clearUserScopedQueries(queryClient);
        queryClient.setQueryData<AuthUser | null>(authKeys.me(), user);
        navigate("/", {replace: true});
      }
    });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim();

    if (!normalizedName) {
      setValidationError("Display name is required");
      return;
    }

    if (!normalizedEmail) {
      setValidationError("Email is required");
      return;
    }

    if (password.length < 15) {
      setValidationError("Password must be at least 15 characters");
      return;
    }

    setValidationError(null);

    registerMutation.mutate({
      displayName: normalizedName,
      email: normalizedEmail,
      password
    });
  }


  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">
          AdPulse
        </p>

        <h1>
          Create account
        </h1>


        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">
            Display name
          </label>

          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={displayName}
            disabled={registerMutation.isPending}
            onChange={(event) => {setDisplayName(event.target.value);}}
          />

          <label htmlFor="register-email">
            Email
          </label>

          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={registerMutation.isPending}
            onChange={(event) => {setEmail(event.target.value);}}
          />

          <label htmlFor="register-password">
            Password
          </label>

          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            disabled={registerMutation.isPending}
            onChange={(event) => {setPassword(event.target.value);
            }}
          />

          <p>
            Use at least 15 characters.
          </p>


          {validationError && (
            <p
              className="form-error"
              role="alert"
            >
              {validationError}
            </p>
          )}

          {registerMutation.isError && (
            <p
              className="form-error"
              role="alert"
            >
              {registerMutation.error.message}
            </p>
          )}

          <button
            className="button button--primary"
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating..." : "Create account"}
          </button>
        </form>

        <p> Already registered?{" "}
          <Link
            to="/login"
            className="text-link"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
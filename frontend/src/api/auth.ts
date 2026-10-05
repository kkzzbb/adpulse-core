import type { AuthUser, LoginInput, RegisterInput } from "../types/auth";
import { createApiError } from "./http";

interface AuthResponse {
  user: AuthUser;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response =  await fetch("/api/auth/me", {credentials: "include"});

	if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw await createApiError(response, "Failed to get current user");
  }

  const data: AuthResponse = await response.json();

  return data.user;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", 
    {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await createApiError(response, "Login failed");
  }

  const data: AuthResponse = await response.json();

  return data.user;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const response = await fetch("/api/auth/register",
    {
       method: "POST",
       headers: {"Content-Type":"application/json"},
       credentials: "include",
       body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await createApiError(response, "Registration failed");
  }

  const data: AuthResponse = await response.json();

  return data.user;
}


export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout",
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw await createApiError(response, "Logout failed");
  }
}
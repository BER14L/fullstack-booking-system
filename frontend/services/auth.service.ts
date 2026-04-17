/**
 * Auth service — HTTP wrappers only. Keeps React components free of axios
 * details and makes endpoints trivial to swap or mock in tests.
 */
import { api } from "@/lib/axios";
import type { AuthResponse, User } from "@/types";

export async function register(input: {
  email: string;
  name: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

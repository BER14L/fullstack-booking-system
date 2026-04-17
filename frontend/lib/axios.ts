/**
 * Axios instance with a request interceptor that attaches the JWT, and a
 * response interceptor that clears credentials on 401s so pages can react.
 */
import axios, { AxiosError, AxiosInstance } from "axios";
import { authStorage } from "./authStorage";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      // Let consumers decide whether to redirect; we don't couple axios to
      // Next's router here.
    }
    return Promise.reject(error);
  },
);

/**
 * Narrow an Axios error into a user-friendly message. Prefer this over
 * `(e as any).message` in UI code.
 */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

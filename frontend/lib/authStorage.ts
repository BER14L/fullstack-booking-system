/**
 * Token storage.
 *
 * NOTE: This demo stores the JWT in localStorage for simplicity. For a
 * production deployment, prefer httpOnly cookies set by the server to mitigate
 * XSS token theft — swap this module's implementation without touching the
 * rest of the app.
 */

const TOKEN_KEY = "smartreserve.token";
const USER_KEY = "smartreserve.user";

export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
  getUserRaw(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(USER_KEY);
  },
  setUserRaw(json: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, json);
  },
};

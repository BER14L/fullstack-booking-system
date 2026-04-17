/**
 * useAuth — minimal auth hook.
 *
 * Keeps an in-memory copy of the current user and mirrors it to localStorage
 * via `authStorage`. For a richer app, swap this for React Context + useSWR or
 * React Query; the API surface (`user`, `login`, `register`, `logout`) would
 * not have to change.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { authStorage } from "@/lib/authStorage";
import * as authService from "@/services/auth.service";
import type { User } from "@/types";

interface State {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<State>({ user: null, loading: true });

  // Rehydrate from localStorage on mount, then verify with the server so a
  // stale/forged token doesn't make the UI look logged-in.
  useEffect(() => {
    const raw = authStorage.getUserRaw();
    const cached = raw ? (JSON.parse(raw) as User) : null;
    if (cached) setState({ user: cached, loading: true });

    if (authStorage.getToken()) {
      authService
        .me()
        .then((user) => {
          authStorage.setUserRaw(JSON.stringify(user));
          setState({ user, loading: false });
        })
        .catch(() => {
          authStorage.clear();
          setState({ user: null, loading: false });
        });
    } else {
      setState({ user: null, loading: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await authService.login({ email, password });
    authStorage.setToken(token);
    authStorage.setUserRaw(JSON.stringify(user));
    setState({ user, loading: false });
    return user;
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const { user, token } = await authService.register({ email, name, password });
      authStorage.setToken(token);
      authStorage.setUserRaw(JSON.stringify(user));
      setState({ user, loading: false });
      return user;
    },
    [],
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setState({ user: null, loading: false });
  }, []);

  return { ...state, login, register, logout };
}

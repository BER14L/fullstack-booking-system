"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Client-side route guard. For a real SSR app, enforce on the server as well
 * — this component only hides the UI.
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, loading, requireAdmin, router]);

  if (loading || !user) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }
  if (requireAdmin && user.role !== "ADMIN") {
    return <p className="text-sm text-red-600">Forbidden.</p>;
  }
  return <>{children}</>;
}

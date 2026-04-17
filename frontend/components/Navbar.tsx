"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

/**
 * Top navigation. Client component so it can read auth state. The links shown
 * depend on whether the user is logged in and whether they're an admin.
 */
export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-brand-600">
          SmartReserve
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {!loading && user && (
            <>
              <Link href="/bookings" className="text-slate-700 hover:text-brand-600">
                My bookings
              </Link>
              <Link
                href="/bookings/new"
                className="text-slate-700 hover:text-brand-600"
              >
                New booking
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-slate-700 hover:text-brand-600">
                  Admin
                </Link>
              )}
              <span className="hidden text-slate-500 sm:inline">{user.email}</span>
              <button onClick={logout} className="btn-secondary">
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="text-slate-700 hover:text-brand-600">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

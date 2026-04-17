"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import * as adminService from "@/services/admin.service";
import { errorMessage } from "@/lib/axios";
import type { Analytics, Booking, User } from "@/types";

function AdminInner() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminService.getAnalytics(),
      adminService.listUsers(),
      adminService.listBookings(),
    ])
      .then(([a, u, b]) => {
        setAnalytics(a);
        setUsers(u.items);
        setBookings(b.items);
      })
      .catch((err) => setError(errorMessage(err, "Failed to load dashboard")));
  }, []);

  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Admin dashboard</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {analytics && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Users" value={analytics.totalUsers} />
          <Stat label="Bookings" value={analytics.totalBookings} />
          <Stat label="Confirmed" value={analytics.statusBreakdown.confirmed} />
          <Stat
            label="Revenue"
            value={(analytics.revenueCents / 100).toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })}
          />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Table title="Recent users" empty="No users">
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-100">
              <td className="py-2 pr-3">{u.name}</td>
              <td className="py-2 pr-3 text-slate-500">{u.email}</td>
              <td className="py-2 text-xs font-medium uppercase">{u.role}</td>
            </tr>
          ))}
        </Table>

        <Table title="Recent bookings" empty="No bookings">
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-slate-100">
              <td className="py-2 pr-3">{new Date(b.startTime).toLocaleString()}</td>
              <td className="py-2 pr-3 text-slate-500">{b.user?.email ?? b.userId}</td>
              <td className="py-2 text-xs font-medium uppercase">{b.status.replace("_", " ")}</td>
            </tr>
          ))}
        </Table>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Table({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const isEmpty = !Array.isArray(children) ? !children : children.length === 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {isEmpty ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminInner />
    </ProtectedRoute>
  );
}

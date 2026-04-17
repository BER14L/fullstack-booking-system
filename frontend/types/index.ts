/**
 * Shared TypeScript types mirroring the backend API shapes.
 * Kept in one place so components don't drift out of sync.
 */

export type Role = "USER" | "ADMIN";

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string | null;
  priceCents: number;
  currency: string;
  createdAt: string;
  user?: Pick<User, "id" | "email" | "name">;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  checkoutUrl: string;
}

export interface Analytics {
  totalUsers: number;
  totalBookings: number;
  statusBreakdown: {
    confirmed: number;
    cancelled: number;
    pendingPayment: number;
  };
  revenueCents: number;
}

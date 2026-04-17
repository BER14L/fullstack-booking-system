import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto max-w-md py-12 text-center">
      <div className="mb-4 text-4xl">↩️</div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Payment cancelled</h1>
      <p className="mb-6 text-sm text-slate-600">
        No charge was made. Your booking is still pending payment — start over
        from the form when you&apos;re ready.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/bookings" className="btn-secondary">My bookings</Link>
        <Link href="/bookings/new" className="btn-primary">Try again</Link>
      </div>
    </section>
  );
}

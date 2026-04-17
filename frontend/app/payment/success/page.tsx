import Link from "next/link";

/**
 * Stripe redirects here after a successful checkout. The webhook has
 * (probably) already flipped the booking to CONFIRMED by the time this
 * loads — but we don't rely on that: the user can also verify in "My
 * bookings".
 */
export default function PaymentSuccessPage() {
  return (
    <section className="mx-auto max-w-md py-12 text-center">
      <div className="mb-4 text-4xl">✅</div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Payment received</h1>
      <p className="mb-6 text-sm text-slate-600">
        Your booking will appear as <strong>Confirmed</strong> once Stripe
        finalizes the charge. A confirmation email is on its way.
      </p>
      <Link href="/bookings" className="btn-primary">
        View my bookings
      </Link>
    </section>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-start gap-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Book time,{" "}
        <span className="text-brand-600">not headaches</span>.
      </h1>
      <p className="max-w-xl text-lg text-slate-600">
        SmartReserve handles availability, payments, and confirmations so you
        can focus on the work. Built with Next.js, Express, Prisma, and Stripe.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className="btn-primary">
          Get started
        </Link>
        <Link href="/login" className="btn-secondary">
          I already have an account
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "No double bookings",
            body: "A unique DB constraint plus a serialized transaction make slot collisions impossible.",
          },
          {
            title: "Real payments",
            body: "Stripe Checkout + signed webhooks. Bookings only confirm after the charge succeeds.",
          },
          {
            title: "Built to ship",
            body: "JWT auth, RBAC, rate limiting, Helmet, Swagger docs, and Docker out of the box.",
          },
        ].map((f) => (
          <li
            key={f.title}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

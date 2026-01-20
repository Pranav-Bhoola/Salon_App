import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="space-y-8">
      <header className="rounded-3xl border border-ink/10 bg-white/70 p-8 shadow-lg shadow-black/5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate">SalonOS</p>
        <h1 className="mt-3 text-4xl font-semibold">Phase 1 MVP Dashboard</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate">
          Minimal control panel to test slot holds, bookings, and capacity recovery.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            href: '/tenant',
            title: 'Tenant Selector',
            body: 'Set your tenant and user context before using the dashboard.',
          },
          {
            href: '/dashboard/appointments',
            title: 'Appointments',
            body: "Review today's bookings and manage status quickly.",
          },
          {
            href: '/dashboard/gaps',
            title: 'Gaps',
            body: 'Inspect availability windows and hold short-notice slots.',
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-ink/10 bg-white p-6 shadow-lg shadow-black/5 transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 text-slate">{card.body}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-ink/10 bg-ink px-6 py-8 text-bone">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Booking Test Harness</h2>
            <p className="mt-2 text-bone/80">
              Run availability checks, holds, and booking creation in one place.
            </p>
          </div>
          <Link
            href="/dashboard/book"
            className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-coral/30"
          >
            Open booking flow
          </Link>
        </div>
      </section>
    </main>
  );
}

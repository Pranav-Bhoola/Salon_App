'use client';

import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

export default function BookingPage() {
  const [staffId, setStaffId] = useState('');
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [availability, setAvailability] = useState<string | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const checkAvailability = async () => {
    setStatus(null);
    try {
      const result = await apiFetch<{ available: boolean; reason?: string }>(
        '/api/availability/check',
        {
          method: 'POST',
          body: JSON.stringify({ staffId, startAt, endAt }),
        }
      );
      setAvailability(result.available ? 'Available' : `Unavailable (${result.reason})`);
    } catch (err) {
      setAvailability((err as Error).message);
    }
  };

  const holdSlot = async () => {
    setStatus(null);
    try {
      const result = await apiFetch<{ id: string }>('/api/slots/hold', {
        method: 'POST',
        body: JSON.stringify({ staffId, clientId, serviceId, startAt, endAt }),
      });
      setHoldId(result.id);
      setStatus('Hold created.');
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  const createAppointment = async () => {
    if (!holdId) {
      setStatus('Create a hold first.');
      return;
    }
    setStatus(null);
    try {
      const result = await apiFetch<{ appointment: { id: string } }>(
        '/api/appointments/create',
        {
          method: 'POST',
          headers: {
            'Idempotency-Key': `booking-${holdId}`,
          },
          body: JSON.stringify({
            holdId,
            clientId,
            staffId,
            serviceId,
            startAt,
            endAt,
            source: 'DASHBOARD',
          }),
        }
      );
      setStatus(`Booked appointment ${result.appointment.id}`);
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  return (
    <main className="space-y-8">
      <header className="rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-lg shadow-black/5">
        <h1 className="text-3xl font-semibold">Booking Test Harness</h1>
        <p className="mt-2 text-slate">Run availability, hold, and booking actions end-to-end.</p>
      </header>

      <section className="rounded-3xl border border-ink/10 bg-white p-8 shadow-lg shadow-black/5">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Staff ID</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              placeholder="UUID"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Client ID</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="UUID"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Service ID</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              placeholder="UUID"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Start (ISO)</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              placeholder="2025-01-01T10:00:00Z"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">End (ISO)</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              placeholder="2025-01-01T11:00:00Z"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={checkAvailability}
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-bone"
          >
            Check availability
          </button>
          <button
            type="button"
            onClick={holdSlot}
            className="rounded-full border border-ink/20 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-ink"
          >
            Hold slot
          </button>
          <button
            type="button"
            onClick={createAppointment}
            className="rounded-full bg-coral px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white"
          >
            Create booking
          </button>
        </div>

        {availability ? (
          <p className="mt-4 text-sm text-slate">Availability: {availability}</p>
        ) : null}
        {holdId ? (
          <p className="mt-2 text-sm text-slate">Hold ID: {holdId}</p>
        ) : null}
        {status ? <p className="mt-2 text-sm text-coral">{status}</p> : null}
      </section>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export default function AppointmentsPage() {
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ appointments: any[] }>(
        `/api/appointments?date=${date}`
      );
      setItems(data.appointments ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [date]);

  const handleCancel = async (id: string) => {
    try {
      await apiFetch('/api/appointments/cancel', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: id }),
      });
      await loadAppointments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReschedule = async (id: string) => {
    const startAt = window.prompt('New start time (ISO, e.g. 2025-01-01T10:00:00Z)');
    const endAt = window.prompt('New end time (ISO, e.g. 2025-01-01T11:00:00Z)');
    if (!startAt || !endAt) return;

    try {
      await apiFetch('/api/appointments/reschedule', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: id, startAt, endAt }),
      });
      await loadAppointments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="space-y-8">
      <header className="rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-lg shadow-black/5">
        <h1 className="text-3xl font-semibold">Appointments</h1>
        <p className="mt-2 text-slate">Review and manage daily bookings.</p>
      </header>

      <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-lg shadow-black/5">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-ink/10 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={loadAppointments}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-widest text-bone"
          >
            Refresh
          </button>
          {loading ? <span className="text-sm text-slate">Loading...</span> : null}
          {error ? <span className="text-sm text-coral">{error}</span> : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-lg shadow-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/5 text-xs uppercase tracking-widest text-slate">
            <tr>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate" colSpan={8}>
                  No appointments yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-ink/5">
                  <td className="px-4 py-3">{new Date(item.startAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(item.endAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{item.client?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3">{item.service?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3">{item.staff?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancel(item.id)}
                        className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReschedule(item.id)}
                        className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink"
                      >
                        Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

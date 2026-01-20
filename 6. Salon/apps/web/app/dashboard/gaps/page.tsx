'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

type Gap = {
  staffId: string;
  staffName: string;
  startAt: string;
  endAt: string;
};

export default function GapsPage() {
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadGaps = async () => {
    setError(null);
    try {
      const data = await apiFetch<{ gaps: Gap[] }>(`/api/gaps?date=${date}`);
      setGaps(data.gaps ?? []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadGaps();
  }, [date]);

  const handleHold = async (gap: Gap) => {
    try {
      await apiFetch('/api/slots/hold', {
        method: 'POST',
        body: JSON.stringify({
          staffId: gap.staffId,
          startAt: gap.startAt,
          endAt: gap.endAt,
        }),
      });
      await loadGaps();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="space-y-8">
      <header className="rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-lg shadow-black/5">
        <h1 className="text-3xl font-semibold">Detected Gaps</h1>
        <p className="mt-2 text-slate">Availability windows computed from today's schedule.</p>
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
            onClick={loadGaps}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-widest text-bone"
          >
            Refresh
          </button>
          {error ? <span className="text-sm text-coral">{error}</span> : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-lg shadow-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/5 text-xs uppercase tracking-widest text-slate">
            <tr>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {gaps.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate" colSpan={4}>
                  No gaps found.
                </td>
              </tr>
            ) : (
              gaps.map((gap, index) => (
                <tr key={`${gap.staffId}-${index}`} className="border-t border-ink/5">
                  <td className="px-4 py-3">{gap.staffName}</td>
                  <td className="px-4 py-3">{new Date(gap.startAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(gap.endAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleHold(gap)}
                      className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink"
                    >
                      Hold slot
                    </button>
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

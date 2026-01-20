'use client';

import { useEffect, useState } from 'react';

const storageKey = 'salonos-tenant-context';

type TenantContext = {
  tenantId: string;
  userId: string;
};

export default function TenantPage() {
  const [tenantId, setTenantId] = useState('');
  const [userId, setUserId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as TenantContext;
      setTenantId(parsed.tenantId ?? '');
      setUserId(parsed.userId ?? '');
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSave = () => {
    const context = { tenantId: tenantId.trim(), userId: userId.trim() };
    window.localStorage.setItem(storageKey, JSON.stringify(context));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <main className="space-y-8">
      <header className="rounded-3xl border border-ink/10 bg-white/70 p-8 shadow-lg shadow-black/5">
        <h1 className="text-3xl font-semibold">Tenant Selector</h1>
        <p className="mt-3 text-slate">
          Store your tenant and user context locally. Every API request will send these headers.
        </p>
      </header>

      <section className="rounded-3xl border border-ink/10 bg-white p-8 shadow-lg shadow-black/5">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">Tenant ID</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="UUID"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">User ID</span>
            <input
              className="w-full rounded-xl border border-ink/10 px-4 py-3"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="UUID"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone shadow-lg shadow-black/20"
        >
          Save context
        </button>
        {saved ? <p className="mt-3 text-sm text-coral">Saved.</p> : null}
      </section>
    </main>
  );
}

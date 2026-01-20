export type TenantContext = {
  tenantId: string;
  userId: string;
};

const storageKey = 'salonos-tenant-context';

export function getTenantContext(): TenantContext | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TenantContext;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const context = getTenantContext();
  const headers = new Headers(options?.headers);

  if (context?.tenantId) {
    headers.set('X-Tenant-Id', context.tenantId);
  }
  if (context?.userId) {
    headers.set('X-User-Id', context.userId);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

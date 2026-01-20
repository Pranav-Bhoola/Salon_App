import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server.js';

const tenantId = '11111111-1111-1111-1111-111111111111';

describe('tenant middleware', () => {
  it('rejects missing tenant header', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/availability/check',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'Missing x-tenant-id header' });
  });
});

describe('validation', () => {
  it('rejects invalid availability payload', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/availability/check',
      headers: { 'x-tenant-id': tenantId },
      payload: { staffId: 'not-a-uuid' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('requires idempotency key on create', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/appointments/create',
      headers: { 'x-tenant-id': tenantId },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });
});

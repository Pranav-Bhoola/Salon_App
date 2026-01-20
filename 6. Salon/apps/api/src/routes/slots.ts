import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createSlotHold } from '../services/slots.js';
import { parseBody } from '../utils/validation.js';

const dateSchema = z.preprocess((value) => {
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}, z.date());

const holdSchema = z
  .object({
    staffId: z.string().uuid(),
    startAt: dateSchema,
    endAt: dateSchema,
    clientId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });

export const slotRoutes: FastifyPluginAsync = async (app) => {
  app.post('/hold', async (request, reply) => {
    const body = parseBody(holdSchema, request, reply);
    if (!body) return;

    const result = await createSlotHold({
      tenantId: request.tenantId,
      staffId: body.staffId,
      startAt: body.startAt,
      endAt: body.endAt,
      clientId: body.clientId,
      serviceId: body.serviceId,
    });

    if (!result.ok) {
      reply.code(409).send({ error: 'SLOT_UNAVAILABLE', reason: result.reason });
      return;
    }

    reply.send({
      id: result.hold.id,
      expiresAt: result.hold.expiresAt,
    });
  });
};

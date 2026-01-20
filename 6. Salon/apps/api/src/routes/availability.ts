import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { checkAvailability } from '../services/availability.js';
import { parseBody } from '../utils/validation.js';

const dateSchema = z.preprocess((value) => {
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}, z.date());

const bodySchema = z
  .object({
    staffId: z.string().uuid(),
    startAt: dateSchema,
    endAt: dateSchema,
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });

export const availabilityRoutes: FastifyPluginAsync = async (app) => {
  app.post('/check', async (request, reply) => {
    const body = parseBody(bodySchema, request, reply);
    if (!body) return;

    const result = await checkAvailability({
      tenantId: request.tenantId,
      staffId: body.staffId,
      startAt: body.startAt,
      endAt: body.endAt,
    });

    reply.send(result);
  });
};

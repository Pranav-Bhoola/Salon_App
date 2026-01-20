import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  cancelAppointment,
  createAppointment,
  rescheduleAppointment,
} from '../services/appointments.js';
import { parseBody } from '../utils/validation.js';

const dateSchema = z.preprocess((value) => {
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}, z.date());

const createSchema = z
  .object({
    holdId: z.string().uuid(),
    clientId: z.string().uuid(),
    staffId: z.string().uuid(),
    serviceId: z.string().uuid(),
    startAt: dateSchema,
    endAt: dateSchema,
    source: z.enum(['WHATSAPP', 'VOICE', 'DASHBOARD', 'MANUAL']),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });

const cancelSchema = z.object({
  appointmentId: z.string().uuid(),
});

const rescheduleSchema = z
  .object({
    appointmentId: z.string().uuid(),
    startAt: dateSchema,
    endAt: dateSchema,
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });

export const appointmentRoutes: FastifyPluginAsync = async (app) => {
  app.post('/create', async (request, reply) => {
    const body = parseBody(createSchema, request, reply);
    if (!body) return;

    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey || Array.isArray(idempotencyKey)) {
      reply.code(400).send({ error: 'Missing Idempotency-Key header' });
      return;
    }

    const result = await createAppointment({
      tenantId: request.tenantId,
      holdId: body.holdId,
      clientId: body.clientId,
      staffId: body.staffId,
      serviceId: body.serviceId,
      startAt: body.startAt,
      endAt: body.endAt,
      source: body.source,
      idempotencyKey,
    });

    if (!result.ok) {
      reply.code(409).send({ error: result.error });
      return;
    }

    reply.send({
      appointment: result.appointment,
      idempotent: result.idempotent,
    });
  });

  app.post('/cancel', async (request, reply) => {
    const body = parseBody(cancelSchema, request, reply);
    if (!body) return;

    const result = await cancelAppointment({
      tenantId: request.tenantId,
      appointmentId: body.appointmentId,
    });

    if (!result.ok) {
      reply.code(404).send({ error: result.error });
      return;
    }

    reply.send({ appointment: result.appointment });
  });

  app.post('/reschedule', async (request, reply) => {
    const body = parseBody(rescheduleSchema, request, reply);
    if (!body) return;

    const result = await rescheduleAppointment({
      tenantId: request.tenantId,
      appointmentId: body.appointmentId,
      startAt: body.startAt,
      endAt: body.endAt,
    });

    if (!result.ok) {
      const status = result.error === 'NOT_FOUND' ? 404 : 409;
      reply.code(status).send({ error: result.error });
      return;
    }

    reply.send({ appointment: result.appointment });
  });
};

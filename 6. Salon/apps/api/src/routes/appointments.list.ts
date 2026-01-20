import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { listAppointmentsByDate } from '../services/queries.js';

const querySchema = z.object({
  date: z.string().optional(),
});

export const appointmentListRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.code(400).send({ error: 'Invalid query' });
      return;
    }

    const appointments = await listAppointmentsByDate({
      tenantId: request.tenantId,
      date: parsed.data.date,
    });

    reply.send({ appointments });
  });
};

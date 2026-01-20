import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { listGapsByDate } from '../services/queries.js';

const querySchema = z.object({
  date: z.string().optional(),
  staffId: z.string().uuid().optional(),
});

export const gapRoutes: FastifyPluginAsync = async (app) => {
  app.get('/gaps', async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.code(400).send({ error: 'Invalid query' });
      return;
    }

    const gaps = await listGapsByDate({
      tenantId: request.tenantId,
      date: parsed.data.date,
      staffId: parsed.data.staffId,
    });

    reply.send({ gaps });
  });
};

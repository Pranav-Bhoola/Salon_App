import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError, type ZodSchema } from 'zod';

export function parseBody<T>(schema: ZodSchema<T>, request: FastifyRequest, reply: FastifyReply): T | null {
  try {
    return schema.parse(request.body);
  } catch (error) {
    if (error instanceof ZodError) {
      reply.code(400).send({ error: 'ValidationError', details: error.flatten() });
      return null;
    }
    reply.code(400).send({ error: 'Invalid request body' });
    return null;
  }
}

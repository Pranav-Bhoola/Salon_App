import type { FastifyPluginAsync } from 'fastify';

export const tenantContextPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest('tenantId', null);

  app.addHook('preHandler', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'];
    if (!tenantId || Array.isArray(tenantId) || tenantId.trim().length === 0) {
      reply.code(400).send({ error: 'Missing x-tenant-id header' });
      return;
    }
    request.tenantId = tenantId;
  });
};

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
  }
}

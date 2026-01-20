import Fastify from 'fastify';
import { tenantContextPlugin } from './plugins/tenant.js';
import { availabilityRoutes } from './routes/availability.js';
import { slotRoutes } from './routes/slots.js';
import { appointmentRoutes } from './routes/appointments.js';
import { appointmentListRoutes } from './routes/appointments.list.js';
import { gapRoutes } from './routes/gaps.js';

export function buildServer() {
  const app = Fastify({ logger: true });

  app.register(tenantContextPlugin);
  app.register(availabilityRoutes, { prefix: '/api/availability' });
  app.register(slotRoutes, { prefix: '/api/slots' });
  app.register(appointmentRoutes, { prefix: '/api/appointments' });
  app.register(appointmentListRoutes, { prefix: '/api/appointments' });
  app.register(gapRoutes, { prefix: '/api' });

  return app;
}

import { prisma, type Prisma } from '@salonos/db';

export async function checkAvailability(params: {
  tenantId: string;
  staffId: string;
  startAt: Date;
  endAt: Date;
  excludeAppointmentId?: string;
  db?: Prisma.TransactionClient;
}) {
  const { tenantId, staffId, startAt, endAt, excludeAppointmentId, db } = params;
  const client = db ?? prisma;

  const overlappingAppointment = await client.appointment.findFirst({
    where: {
      tenantId,
      staffId,
      status: 'BOOKED',
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    select: { id: true },
  });

  if (overlappingAppointment) {
    return { available: false, reason: 'appointment' };
  }

  const now = new Date();
  const overlappingHold = await client.slotHold.findFirst({
    where: {
      tenantId,
      staffId,
      expiresAt: { gt: now },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });

  if (overlappingHold) {
    return { available: false, reason: 'hold' };
  }

  return { available: true };
}

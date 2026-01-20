import { prisma } from '@salonos/db';
import { checkAvailability } from './availability.js';

export async function createSlotHold(params: {
  tenantId: string;
  staffId: string;
  startAt: Date;
  endAt: Date;
  clientId?: string;
  serviceId?: string;
}) {
  const { tenantId, staffId, startAt, endAt, clientId, serviceId } = params;

  const availability = await checkAvailability({ tenantId, staffId, startAt, endAt });
  if (!availability.available) {
    return { ok: false, reason: availability.reason };
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  const hold = await prisma.$transaction(async (tx) => {
    return tx.slotHold.create({
      data: {
        tenantId,
        staffId,
        startAt,
        endAt,
        clientId,
        serviceId,
        expiresAt,
      },
    });
  });

  return { ok: true, hold };
}

export async function getValidHold(params: {
  tenantId: string;
  holdId: string;
}) {
  const { tenantId, holdId } = params;
  const now = new Date();
  return prisma.slotHold.findFirst({
    where: {
      id: holdId,
      tenantId,
      expiresAt: { gt: now },
    },
  });
}

import { prisma, type AppointmentSource, type AppointmentStatus } from '@salonos/db';
import { checkAvailability } from './availability.js';

export async function createAppointment(params: {
  tenantId: string;
  holdId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  source: AppointmentSource;
  idempotencyKey?: string;
}) {
  const {
    tenantId,
    holdId,
    clientId,
    staffId,
    serviceId,
    startAt,
    endAt,
    source,
    idempotencyKey,
  } = params;

  return prisma.$transaction(async (tx) => {
    if (idempotencyKey) {
      const existing = await tx.appointment.findFirst({
        where: { tenantId, idempotencyKey },
      });
      if (existing) {
        return { ok: true, appointment: existing, idempotent: true };
      }
    }

    const hold = await tx.slotHold.findFirst({
      where: {
        id: holdId,
        tenantId,
        expiresAt: { gt: new Date() },
      },
    });
    if (!hold) {
      return { ok: false, error: 'INVALID_HOLD' } as const;
    }

    if (
      hold.staffId !== staffId ||
      hold.startAt.getTime() !== startAt.getTime() ||
      hold.endAt.getTime() !== endAt.getTime() ||
      (hold.serviceId && hold.serviceId !== serviceId) ||
      (hold.clientId && hold.clientId !== clientId)
    ) {
      return { ok: false, error: 'HOLD_MISMATCH' } as const;
    }

    const availability = await checkAvailability({
      tenantId,
      staffId,
      startAt,
      endAt,
      db: tx,
    });
    if (!availability.available) {
      return { ok: false, error: 'SLOT_UNAVAILABLE' } as const;
    }

    const appointment = await tx.appointment.create({
      data: {
        tenantId,
        clientId,
        staffId,
        serviceId,
        startAt,
        endAt,
        source,
        idempotencyKey,
        status: 'BOOKED',
      },
    });

    await tx.slotHold.deleteMany({ where: { id: holdId, tenantId } });

    return { ok: true, appointment, idempotent: false } as const;
  });
}

export async function cancelAppointment(params: {
  tenantId: string;
  appointmentId: string;
  reason?: string;
}) {
  const { tenantId, appointmentId } = params;

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.appointment.updateMany({
      where: { id: appointmentId, tenantId },
      data: { status: 'CANCELLED' as AppointmentStatus },
    });

    if (updateResult.count === 0) {
      return { ok: false, error: 'NOT_FOUND' } as const;
    }

    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    return { ok: true, appointment: appointment! } as const;
  });
}

export async function rescheduleAppointment(params: {
  tenantId: string;
  appointmentId: string;
  startAt: Date;
  endAt: Date;
}) {
  const { tenantId, appointmentId, startAt, endAt } = params;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    if (!existing) {
      return { ok: false, error: 'NOT_FOUND' } as const;
    }

    if (existing.status !== 'BOOKED') {
      return { ok: false, error: 'NOT_ACTIVE' } as const;
    }

    const availability = await checkAvailability({
      tenantId,
      staffId: existing.staffId,
      startAt,
      endAt,
      excludeAppointmentId: appointmentId,
      db: tx,
    });
    if (!availability.available) {
      return { ok: false, error: 'SLOT_UNAVAILABLE' } as const;
    }

    const updateResult = await tx.appointment.updateMany({
      where: { id: appointmentId, tenantId },
      data: { startAt, endAt },
    });

    if (updateResult.count === 0) {
      return { ok: false, error: 'NOT_FOUND' } as const;
    }

    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    return { ok: true, appointment: appointment! } as const;
  });
}

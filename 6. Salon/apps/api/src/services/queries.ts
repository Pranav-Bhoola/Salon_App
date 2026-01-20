import { prisma } from '@salonos/db';

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parseDateInput(input?: string) {
  if (!input) return new Date();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function listAppointmentsByDate(params: {
  tenantId: string;
  date?: string;
}) {
  const { tenantId, date } = params;
  const day = parseDateInput(date);

  return prisma.appointment.findMany({
    where: {
      tenantId,
      startAt: {
        gte: startOfDay(day),
        lte: endOfDay(day),
      },
    },
    include: {
      client: true,
      staff: true,
      service: true,
    },
    orderBy: { startAt: 'asc' },
  });
}

type Gap = {
  staffId: string;
  staffName: string;
  startAt: Date;
  endAt: Date;
};

export async function listGapsByDate(params: {
  tenantId: string;
  date?: string;
  staffId?: string;
}) {
  const { tenantId, date, staffId } = params;
  const day = parseDateInput(date);
  const businessStart = new Date(day);
  businessStart.setHours(9, 0, 0, 0);
  const businessEnd = new Date(day);
  businessEnd.setHours(18, 0, 0, 0);

  const staffList = await prisma.staff.findMany({
    where: {
      tenantId,
      ...(staffId ? { id: staffId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  const gaps: Gap[] = [];

  for (const staff of staffList) {
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        staffId: staff.id,
        status: 'BOOKED',
        startAt: {
          gte: businessStart,
          lt: businessEnd,
        },
      },
      orderBy: { startAt: 'asc' },
    });

    let cursor = businessStart;

    for (const appt of appointments) {
      if (appt.startAt > cursor) {
        gaps.push({
          staffId: staff.id,
          staffName: staff.name,
          startAt: cursor,
          endAt: appt.startAt,
        });
      }
      if (appt.endAt > cursor) {
        cursor = appt.endAt;
      }
    }

    if (cursor < businessEnd) {
      gaps.push({
        staffId: staff.id,
        staffName: staff.name,
        startAt: cursor,
        endAt: businessEnd,
      });
    }
  }

  return gaps;
}

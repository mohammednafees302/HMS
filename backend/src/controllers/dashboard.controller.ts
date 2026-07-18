// ============================================================
// src/controllers/dashboard.controller.ts
// GET /api/dashboard/stats — Real-time dashboard aggregations.
// Uses only Prisma ORM (no raw SQL) to avoid column-name issues.
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

// Helper: extract month number (1-12) from a Date
const monthOf = (d: Date) => d.getMonth() + 1;

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();

  // Today's date range
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Current year start
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // ---- Run all ORM queries concurrently ----
  const [
    totalPatients,
    activePatients,
    criticalPatients,
    totalDoctors,
    activeDoctors,
    todayAppointmentCount,
    scheduledToday,
    recentPatients,
    todayAppointments,
    patientsThisYear,
    paidInvoicesThisYear,
    deptDistribution,
    paidRevenue,
    pendingBilling,
  ] = await Promise.all([
    // Patient counts
    prisma.patient.count(),
    prisma.patient.count({ where: { status: 'ACTIVE' } }),
    prisma.patient.count({ where: { status: 'CRITICAL' } }),

    // Doctor counts
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isActive: true } }),

    // Today appointment counts
    prisma.appointment.count({
      where: { scheduledAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.appointment.count({
      where: { scheduledAt: { gte: todayStart, lte: todayEnd }, status: 'SCHEDULED' },
    }),

    // Recent patients (last 5)
    prisma.patient.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        department: true,
        roomNumber: true,
        status: true,
        patientCode: true,
      },
    }),

    // Today's appointments with patient + doctor name
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: todayStart, lte: todayEnd } },
      take: 8,
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        type: true,
        patient: { select: { name: true } },
        doctor: { select: { user: { select: { name: true } } } },
      },
    }),

    // All patients admitted this year (for monthly chart)
    prisma.patient.findMany({
      where: { admittedAt: { gte: yearStart } },
      select: { admittedAt: true },
    }),

    // All paid invoices this year (for revenue chart)
    prisma.invoice.findMany({
      where: { status: 'PAID', issuedAt: { gte: yearStart } },
      select: { issuedAt: true, amount: true },
    }),

    // Patient count per department
    prisma.patient.groupBy({
      by: ['department'],
      _count: { id: true },
      where: { department: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 6,
    }),

    // Total paid revenue (all time)
    prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),

    // Pending billing count
    prisma.invoice.count({ where: { status: 'PENDING' } }),
  ]);

  // ---- Build monthly admissions chart (group by month in JS) ----
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const admissionsMap = new Map<number, number>();
  for (const p of patientsThisYear) {
    const m = monthOf(new Date(p.admittedAt));
    admissionsMap.set(m, (admissionsMap.get(m) ?? 0) + 1);
  }
  const admissionsChart = MONTHS.map((month, i) => ({
    month,
    patients: admissionsMap.get(i + 1) ?? 0,
  }));

  // ---- Build monthly revenue chart (group by month in JS) ----
  const revenueMap = new Map<number, number>();
  for (const inv of paidInvoicesThisYear) {
    const m = monthOf(new Date(inv.issuedAt));
    revenueMap.set(m, (revenueMap.get(m) ?? 0) + Number(inv.amount));
  }
  const revenueChart = MONTHS.map((month, i) => ({
    month,
    revenue: Math.round(revenueMap.get(i + 1) ?? 0),
  }));

  // ---- Department distribution chart ----
  const DEPT_COLORS: Record<string, string> = {
    Cardiology: '#F43F5E', Neurology: '#6366F1', Orthopedics: '#0EA5E9',
    Pediatrics: '#10B981', Dermatology: '#F59E0B', Oncology: '#06B6D4',
    Obstetrics: '#EC4899', 'General Surgery': '#8B5CF6',
  };
  const totalInDepts = deptDistribution.reduce((s, d) => s + d._count.id, 0) || 1;
  const deptChart = deptDistribution.map(d => ({
    name: d.department ?? 'Other',
    value: Math.round((d._count.id / totalInDepts) * 100),
    color: DEPT_COLORS[d.department ?? ''] ?? '#94A3B8',
  }));

  // ---- Format today's appointments ----
  const appointmentsFormatted = todayAppointments.map(a => ({
    id: a.id,
    patient: a.patient.name,
    doctor: a.doctor.user.name,
    time: new Date(a.scheduledAt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    }),
    status: a.status.charAt(0) + a.status.slice(1).toLowerCase().replace('_', ' '),
    type:   a.type.charAt(0)   + a.type.slice(1).toLowerCase().replace('_', ' '),
  }));

  sendSuccess(res, {
    stats: {
      totalPatients,
      activePatients,
      criticalPatients,
      totalDoctors,
      activeDoctors,
      todayAppointments: todayAppointmentCount,
      scheduledToday,
      totalRevenue:  Number(paidRevenue._sum.amount ?? 0),
      pendingBilling,
      // Beds are static until a Bed model is added
      totalBeds:    157,
      occupiedBeds: 102,
    },
    charts: {
      admissions:      admissionsChart,
      deptDistribution: deptChart,
      monthlyRevenue:  revenueChart,
    },
    recentPatients,
    todayAppointments: appointmentsFormatted,
  });
};

import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getReports = async (req: Request, res: Response) => {
  try {
    const [
      totalPatients,
      totalAppointments,
      invoices,
      departments,
      doctorsCount,
      appointments
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.invoice.findMany({ select: { amount: true, status: true } }),
      prisma.department.findMany({
        include: {
          _count: {
            select: { doctors: true }
          }
        }
      }),
      prisma.doctor.count(),
      prisma.appointment.findMany({
        include: { department: true }
      })
    ]);

    const totalRevenue = invoices.reduce((s, i) => s + Number(i.amount), 0);
    const collected = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0);
    const collectionRate = totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;

    // Build Department Staff Data
    const staffData = departments.map(d => ({
      dept: d.name,
      doctors: d._count.doctors,
      nurses: Math.floor(d._count.doctors * 2.5) // Simulated ratio for nurses
    }));

    res.json({
      metrics: {
        totalPatients,
        totalAppointments,
        totalRevenue,
        collectionRate,
        avgSatisfaction: 4.5,
        bedOccupancy: 82
      },
      staffData,
      appointments
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

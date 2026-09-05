import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      inProgressBookings,
      assignedBookings,
      totalCustomers,
      totalMechanics,
      revenueAggregate,
    ] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      this.prisma.booking.count({ where: { status: BookingStatus.ASSIGNED } }),
      this.prisma.customer.count(),
      this.prisma.mechanic.count(),
      this.prisma.booking.aggregate({
        _sum: { amount: true },
        where: { status: BookingStatus.COMPLETED },
      }),
    ]);

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      inProgressBookings,
      assignedBookings,
      totalCustomers,
      totalMechanics,
      totalRevenue: revenueAggregate._sum.amount ?? 0,
    };
  }

  async getAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Batch 1: independent queries — run in parallel instead of sequentially
    const [bookingsByStatus, bookingsByService, recentBookings, mechanicPerformance] =
      await Promise.all([
        this.prisma.booking.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.booking.groupBy({
          by: ['serviceId'],
          _count: { id: true },
          _sum: { amount: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        this.prisma.booking.findMany({
          where: { bookingDate: { gte: thirtyDaysAgo } },
          select: { bookingDate: true, amount: true, status: true },
          orderBy: { bookingDate: 'asc' },
        }),
        this.prisma.booking.groupBy({
          by: ['mechanicId'],
          where: {
            mechanicId: { not: null },
            status: BookingStatus.COMPLETED,
          },
          _count: { id: true },
          _sum: { amount: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
      ]);

    // Batch 2: name lookups — depend on batch 1 results, also run in parallel with each other
    const serviceIds = bookingsByService.map((b) => b.serviceId);
    const mechanicIds = mechanicPerformance
      .map((m) => m.mechanicId)
      .filter(Boolean) as string[];

    const [services, mechanics] = await Promise.all([
      this.prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, name: true },
      }),
      this.prisma.mechanic.findMany({
        where: { id: { in: mechanicIds } },
        select: { id: true, name: true },
      }),
    ]);

    const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]));
    const mechanicMap = Object.fromEntries(mechanics.map((m) => [m.id, m.name]));

    // Group bookings by date — in-memory only, no DB call, unchanged
    const bookingsByDate: Record<string, { count: number; revenue: number }> = {};
    for (const booking of recentBookings) {
      const dateKey = booking.bookingDate.toISOString().split('T')[0];
      if (!bookingsByDate[dateKey]) {
        bookingsByDate[dateKey] = { count: 0, revenue: 0 };
      }
      bookingsByDate[dateKey].count++;
      if (booking.status === BookingStatus.COMPLETED) {
        bookingsByDate[dateKey].revenue += booking.amount;
      }
    }

    return {
      bookingsByStatus: bookingsByStatus.map((b) => ({
        status: b.status,
        count: b._count.id,
      })),
      bookingsByService: bookingsByService.map((b) => ({
        serviceId: b.serviceId,
        serviceName: serviceMap[b.serviceId] ?? 'Unknown',
        count: b._count.id,
        revenue: b._sum.amount ?? 0,
      })),
      bookingsByDate: Object.entries(bookingsByDate).map(([date, data]) => ({
        date,
        count: data.count,
        revenue: data.revenue,
      })),
      mechanicPerformance: mechanicPerformance.map((m) => ({
        mechanicId: m.mechanicId,
        mechanicName: m.mechanicId ? (mechanicMap[m.mechanicId] ?? 'Unknown') : 'Unassigned',
        completedBookings: m._count.id,
        totalRevenue: m._sum.amount ?? 0,
      })),
    };
  }
}
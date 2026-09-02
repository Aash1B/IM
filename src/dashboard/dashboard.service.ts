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
    // Bookings by status
    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Bookings by service (top 10)
    const bookingsByService = await this.prisma.booking.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get service names for those IDs
    const serviceIds = bookingsByService.map((b) => b.serviceId);
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    });
    const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]));

    // Bookings over last 30 days (by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await this.prisma.booking.findMany({
      where: { bookingDate: { gte: thirtyDaysAgo } },
      select: { bookingDate: true, amount: true, status: true },
      orderBy: { bookingDate: 'asc' },
    });

    // Group by date
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

    // Mechanic performance (top 10 by completed bookings)
    const mechanicPerformance = await this.prisma.booking.groupBy({
      by: ['mechanicId'],
      where: {
        mechanicId: { not: null },
        status: BookingStatus.COMPLETED,
      },
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const mechanicIds = mechanicPerformance
      .map((m) => m.mechanicId)
      .filter(Boolean) as string[];
    const mechanics = await this.prisma.mechanic.findMany({
      where: { id: { in: mechanicIds } },
      select: { id: true, name: true },
    });
    const mechanicMap = Object.fromEntries(mechanics.map((m) => [m.id, m.name]));

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

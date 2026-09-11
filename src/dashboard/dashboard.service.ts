import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private overviewCache: { data: any; expiry: number } | null = null;
  private analyticsCache: { data: any; expiry: number } | null = null;
  private readonly CACHE_TTL_MS = 30000; // 30 seconds TTL

  constructor(private prisma: PrismaService) {}

  clearCache() {
    this.overviewCache = null;
    this.analyticsCache = null;
  }

  async getOverview() {
    if (this.overviewCache && Date.now() < this.overviewCache.expiry) {
      return this.overviewCache.data;
    }

    const [
      statusCounts,
      totalCustomers,
      totalMechanics,
      revenueAggregate,
    ] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.customer.count(),
      this.prisma.mechanic.count(),
      this.prisma.booking.aggregate({
        _sum: { amount: true },
        where: { status: BookingStatus.COMPLETED },
      }),
    ]);

    const counts: Record<string, number> = {};
    let totalBookings = 0;
    for (const item of statusCounts) {
      counts[item.status] = item._count.id;
      totalBookings += item._count.id;
    }

    const result = {
      totalBookings,
      completedBookings: counts[BookingStatus.COMPLETED] ?? 0,
      pendingBookings: counts[BookingStatus.PENDING] ?? 0,
      cancelledBookings: counts[BookingStatus.CANCELLED] ?? 0,
      inProgressBookings: counts[BookingStatus.IN_PROGRESS] ?? 0,
      assignedBookings: counts[BookingStatus.ASSIGNED] ?? 0,
      totalCustomers,
      totalMechanics,
      totalRevenue: revenueAggregate._sum.amount ?? 0,
    };

    this.overviewCache = { data: result, expiry: Date.now() + this.CACHE_TTL_MS };
    return result;
  }

  async getAnalytics() {
    if (this.analyticsCache && Date.now() < this.analyticsCache.expiry) {
      return this.analyticsCache.data;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Stage 1: Run all independent aggregations concurrently
    const [
      bookingsByStatus,
      bookingsByService,
      recentBookings,
      mechanicPerformance,
    ] = await Promise.all([
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

    // Stage 2: Fetch service names and mechanic names concurrently
    const serviceIds = bookingsByService.map((b) => b.serviceId);
    const mechanicIds = mechanicPerformance
      .map((m) => m.mechanicId)
      .filter(Boolean) as string[];

    const [services, mechanics] = await Promise.all([
      serviceIds.length > 0
        ? this.prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, name: true },
          })
        : [],
      mechanicIds.length > 0
        ? this.prisma.mechanic.findMany({
            where: { id: { in: mechanicIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]));
    const mechanicMap = Object.fromEntries(mechanics.map((m) => [m.id, m.name]));

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

    const result = {
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

    this.analyticsCache = { data: result, expiry: Date.now() + this.CACHE_TTL_MS };
    return result;
  }
}

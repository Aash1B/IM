import { apiFetch } from "../lib/api";
import { DashboardResponse, AnalyticsResponse } from "../types/dashboard";


export const dashboardService = {
  async getDashboardMetrics(): Promise<DashboardResponse> {
    

    try {
      const backendData = await apiFetch<any>("/dashboard");
      // Map NestJS backend overview response shape
      const raw = backendData?.data || backendData;
      return {
        data: {
          metrics: {
            totalBookings: raw.totalBookings ?? 0,
            completedBookings: raw.completedBookings ?? 0,
            pendingBookings: raw.pendingBookings ?? 0,
            cancelledBookings: raw.cancelledBookings ?? 0,
            inProgressBookings: raw.inProgressBookings ?? 0,
            assignedBookings: raw.assignedBookings ?? 0,
            totalRevenue: raw.totalRevenue ?? 0,
            activeMechanics: raw.totalMechanics ?? 0,
            totalMechanics: raw.totalMechanics ?? 0,
            totalCustomers: raw.totalCustomers ?? 0,
            todayBookings: raw.inProgressBookings ?? 0,
            newCustomers: raw.totalCustomers ?? 0,
          },
        },
      };
    } catch (err) { throw err; }
  },

  async getAnalyticsData(): Promise<AnalyticsResponse> {
    

    try {
      const backendData = await apiFetch<any>("/dashboard/analytics");
      const raw = backendData?.data || backendData;

      if (!raw || (!raw.bookingsByStatus && !raw.bookingStatus)) {
        return { data: { bookingsOverTime: [], revenueOverTime: [], bookingStatus: [], serviceBreakdown: [], mechanicPerformance: [] } };
      }

      // Map NestJS analytics format to frontend format
      const bookingsOverTime = (raw.bookingsByDate || raw.bookingsOverTime || []).map((b: any) => ({
        date: b.date,
        count: b.count,
        revenue: b.revenue ?? 0,
      }));

      const revenueOverTime = (raw.bookingsByDate || raw.revenueOverTime || []).map((r: any) => ({
        date: r.date,
        revenue: r.revenue ?? 0,
      }));

      const bookingStatus = (raw.bookingsByStatus || raw.bookingStatus || []).map((s: any) => ({
        status: s.status,
        count: s.count,
      }));

      const serviceBreakdown = (raw.bookingsByService || raw.serviceBreakdown || []).map((s: any) => ({
        category: s.serviceName || s.category || "Service",
        serviceName: s.serviceName || s.category || "Service",
        count: s.count,
        revenue: s.revenue ?? 0,
      }));

      const mechanicPerformance = (raw.mechanicPerformance || []).map((m: any) => ({
        mechanicId: m.mechanicId,
        mechanicName: m.mechanicName,
        completedBookings: m.completedBookings,
        totalRevenue: m.totalRevenue,
      }));

      return {
        data: {
          bookingsOverTime,
          revenueOverTime,
          bookingStatus,
          serviceBreakdown,
          mechanicPerformance,
        },
      };
    } catch (err) { throw err; }
  },
};

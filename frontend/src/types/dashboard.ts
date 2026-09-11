import { BookingStatus } from "./booking";

export interface DashboardMetrics {
  totalBookings: number;
  todayBookings?: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  inProgressBookings?: number;
  assignedBookings?: number;
  totalCustomers?: number;
  totalMechanics?: number;
  totalRevenue: number;
  activeMechanics?: number;
  newCustomers?: number;
}

export interface DashboardResponse {
  data: {
    metrics: DashboardMetrics;
  };
}

export interface BookingOverTimePoint {
  date: string;
  count: number;
  revenue?: number;
}

export interface RevenueOverTimePoint {
  date: string;
  revenue: number;
}

export interface BookingStatusCount {
  status: BookingStatus | string;
  count: number;
}

export interface ServiceBreakdownItem {
  category: string;
  serviceName?: string;
  count: number;
  revenue?: number;
}

export interface MechanicPerformanceItem {
  mechanicId: string;
  mechanicName: string;
  completedBookings: number;
  totalRevenue: number;
}

export interface AnalyticsData {
  bookingsOverTime: BookingOverTimePoint[];
  revenueOverTime: RevenueOverTimePoint[];
  bookingStatus: BookingStatusCount[];
  serviceBreakdown: ServiceBreakdownItem[];
  mechanicPerformance?: MechanicPerformanceItem[];
}

export interface AnalyticsResponse {
  data: AnalyticsData;
}

export interface ActivityNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

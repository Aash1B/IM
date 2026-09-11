import React from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  IndianRupee,
  Wrench,
  UserPlus,
} from "lucide-react";
import { DashboardMetrics } from "@/types/dashboard";
import { MetricCard } from "./MetricCard";
import { formatCurrencyINR } from "@/lib/utils";

interface MetricGridProps {
  metrics: DashboardMetrics;
}

export const MetricGrid: React.FC<MetricGridProps> = ({ metrics }) => {
  const brandIconStyle = "bg-white dark:bg-card text-sky-500 dark:text-sky-400 border border-border shadow-2xs";

  return (
    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4">
      {/* 1. Total Bookings */}
      <MetricCard
        title="Total Bookings"
        value={(metrics.totalBookings ?? 0).toLocaleString("en-IN")}
        icon={<CalendarCheck className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 2. Today's Bookings */}
      <MetricCard
        title="Today's Bookings"
        value={(metrics.todayBookings ?? 0).toLocaleString("en-IN")}
        icon={<Clock className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 3. Completed Bookings */}
      <MetricCard
        title="Completed"
        value={(metrics.completedBookings ?? 0).toLocaleString("en-IN")}
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 4. Pending Bookings */}
      <MetricCard
        title="Pending"
        value={(metrics.pendingBookings ?? 0).toLocaleString("en-IN")}
        icon={<AlertCircle className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 5. Cancelled Bookings */}
      <MetricCard
        title="Cancelled"
        value={(metrics.cancelledBookings ?? 0).toLocaleString("en-IN")}
        icon={<XCircle className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 6. Total Revenue */}
      <MetricCard
        title="Total Revenue"
        value={formatCurrencyINR(metrics.totalRevenue ?? 0)}
        icon={<IndianRupee className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 7. Active Mechanics */}
      <MetricCard
        title="Active Mechanics"
        value={(metrics.activeMechanics ?? 0).toLocaleString("en-IN")}
        icon={<Wrench className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />

      {/* 8. New Customers */}
      <MetricCard
        title="New Customers"
        value={(metrics.newCustomers ?? 0).toLocaleString("en-IN")}
        icon={<UserPlus className="h-6 w-6" />}
        iconColor={brandIconStyle}
      />
    </div>
  );
};

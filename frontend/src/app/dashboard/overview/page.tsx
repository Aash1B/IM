"use client";

import React, { useEffect, useCallback } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { OperationalSnapshot } from "@/components/dashboard/OperationalSnapshot";
import { BookingsChart } from "@/components/charts/BookingsChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { ServiceBarChart } from "@/components/charts/ServiceBarChart";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

export default function OperationsOverviewPage() {
  const { metrics, analytics, loading, error, refresh: refreshDashboard } = useDashboard();

  const handleRefresh = useCallback(async () => {
    await refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    const onRefresh = () => {
      handleRefresh();
    };
    window.addEventListener("dashboard-refresh", onRefresh);
    return () => window.removeEventListener("dashboard-refresh", onRefresh);
  }, [handleRefresh]);

  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 overflow-x-hidden pt-2">
      {/* Today at a Glance Operational Telemetry Banner */}
      {metrics && <OperationalSnapshot metrics={metrics} />}

      {/* 8 Business KPI Metrics Grid */}
      {loading || !metrics ? (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <MetricGrid metrics={metrics} />
      )}

      {/* Primary Analytics Charts Section */}
      {loading || !analytics ? (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ChartSkeleton />
            </div>
            <div className="lg:col-span-5">
              <ChartSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Primary Analytics Row: Bookings Over Time (7 cols) & Status Distribution (5 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <BookingsChart data={analytics.bookingsOverTime} />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <StatusDonutChart data={analytics.bookingStatus} />
            </div>
          </div>

          {/* Secondary Analytics Row: Revenue Over Time (7 cols) & Service Category (5 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <RevenueChart data={analytics.revenueOverTime} />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <ServiceBarChart data={analytics.serviceBreakdown} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

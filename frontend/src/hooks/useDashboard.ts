"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardMetrics, AnalyticsData } from "../types/dashboard";
import { dashboardService } from "../services/dashboard.service";

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, analyticsRes] = await Promise.all([
        dashboardService.getDashboardMetrics(),
        dashboardService.getAnalyticsData(),
      ]);
      setMetrics(metricsRes.data.metrics);
      setAnalytics(analyticsRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    metrics,
    analytics,
    loading,
    error,
    refresh: fetchDashboardData,
  };
}

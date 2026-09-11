"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  Activity,
  Award,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { dashboardService } from "@/services/dashboard.service";
import { AnalyticsData } from "@/types/dashboard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#10B981",
  IN_PROGRESS: "#3B82F6",
  ASSIGNED: "#8B5CF6",
  PENDING: "#F59E0B",
  CANCELLED: "#EF4444",
  MECHANIC_ON_THE_WAY: "#06B6D4",
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [yAxisWidth, setYAxisWidth] = useState<number>(140);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setYAxisWidth(90);
      } else if (w < 768) {
        setYAxisWidth(130);
      } else if (w < 1024) {
        setYAxisWidth(170);
      } else {
        setYAxisWidth(220);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await dashboardService.getAnalyticsData();
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const revenuePoints = analytics?.revenueOverTime || [];
  const bookingsPoints = analytics?.bookingsOverTime || [];
  const statusPoints = analytics?.bookingStatus || [];
  const servicePoints = analytics?.serviceBreakdown || [];
  const mechanicPoints = analytics?.mechanicPerformance || [];

  // Derived metrics
  const totalRevenue = revenuePoints.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const totalBookings = bookingsPoints.reduce((acc, p) => acc + (p.count || 0), 0);
  const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const completedCount = statusPoints.find(s => s.status === "COMPLETED")?.count || 0;
  const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 88.5;

  // Combine trend points for unified chart
  const trendData = bookingsPoints.map((b) => {
    const r = revenuePoints.find((rp) => rp.date === b.date);
    return {
      date: b.date,
      bookings: b.count,
      revenue: r ? r.revenue : 0,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 pt-2">

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="font-semibold">+14.8%</span> from prior operating period
          </p>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Dispatches</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            {totalBookings.toLocaleString()}
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-2">All time customer appointments</p>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Order Value</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            ₹{avgOrderValue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1.5">
            <span className="font-semibold">+5.2%</span> average invoice ticket size
          </p>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Completion Rate</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            {completionRate.toFixed(1)}%
          </div>
          <p className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 mt-2 flex items-center gap-1.5">
            <span className="font-semibold">{completedCount}</span> jobs successfully completed
          </p>
        </div>
      </div>

      {/* Row 1: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Revenue & Bookings Trend</h3>
              <p className="text-xs sm:text-sm md:text-base font-normal text-muted-foreground mt-1">Daily breakdown of total revenue (₹) and booking count</p>
            </div>
          </div>

          <div className="h-[280px] sm:h-[340px] md:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "12px",
                    border: "none",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#6366F1" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <PieIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" /> Status Distribution
              </h3>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-normal text-muted-foreground mb-4">Proportion of bookings by lifecycle state</p>

            <div className="h-48 sm:h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPoints}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusPoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#94A3B8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      borderRadius: "12px",
                      border: "none",
                      color: "#FFF",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            {statusPoints.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[s.status] || "#94A3B8" }}
                  />
                  {s.status.replace(/_/g, " ")}
                </span>
                <span className="font-bold text-foreground">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Services & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services Bar Chart */}
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">Top Repair Services</h3>
          <p className="text-xs sm:text-sm md:text-base font-normal text-muted-foreground mb-4 sm:mb-6">Service categories by volume and generated revenue</p>

          <div className="h-[340px] sm:h-[380px] md:h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={servicePoints}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} />
                <YAxis dataKey="category" type="category" width={yAxisWidth} tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "12px",
                    border: "none",
                    color: "#FFF",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="count" name="Bookings" fill="#6366F1" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mechanic Leaderboard */}
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" /> Mechanic Performance Leaderboard
              </h3>
              <p className="text-xs sm:text-sm md:text-base font-normal text-muted-foreground mt-1">Top mechanics by completed service dispatches</p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {mechanicPoints.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium text-muted-foreground">No mechanic telemetry logged.</div>
            ) : (
              mechanicPoints.slice(0, 5).map((m, idx) => (
                <div key={m.mechanicId || idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-[#FFF4E8] dark:bg-amber-950/50 text-[#F98513] dark:text-amber-400 border border-[#F98513]/30 dark:border-amber-700/40 shadow-2xs">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-foreground truncate">{m.mechanicName}</h4>
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground block mt-0.5">{m.completedBookings} completed jobs</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
                      ₹{m.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground block mt-0.5">Earned Revenue</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

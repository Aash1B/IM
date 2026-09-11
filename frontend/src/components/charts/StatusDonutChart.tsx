"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { BookingStatusCount } from "@/types/dashboard";

interface StatusDonutChartProps {
  data: BookingStatusCount[];
}

const statusColors: Record<string, string> = {
  COMPLETED: "#10B981", // Emerald
  PENDING: "#F43F5E", // Red / Rose
  ASSIGNED: "#D97706", // Dark Yellow / Amber
  MECHANIC_ON_THE_WAY: "#0EA5E9", // Sky / Light Blue
  IN_PROGRESS: "#8B5CF6", // Purple
  CANCELLED: "#64748B", // Slate
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  MECHANIC_ON_THE_WAY: "On The Way",
  IN_PROGRESS: "In Progress",
  CANCELLED: "Cancelled",
};

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-3xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-4 sm:p-6 md:p-8 shadow-2xs">
      <div className="pb-4 sm:pb-5 border-b border-secondary">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Booking Status</h3>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-normal mt-0.5 sm:mt-1">
          Current distribution by status
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 pt-4 sm:pt-6">
        {/* Donut Chart Centered */}
        <div className="h-[220px] sm:h-[260px] md:h-[280px] w-full max-w-[320px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={statusColors[entry.status] || "#9CA3AF"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#24201C",
                  border: "1px solid #403830",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "800",
                  padding: "10px 14px",
                }}
                formatter={(value: any, name: any) => [
                  `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                  statusLabels[name] || name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-none">{total}</span>
            <span className="text-[10px] sm:text-xs text-[#938C82] font-semibold uppercase mt-0.5">TOTAL</span>
          </div>
        </div>

        {/* Legend Cards Row Horizontally Below Chart */}
        <div className="w-full flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 pt-2">
          {data.map((item) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
            return (
              <div key={item.status} className="flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#FFF4E8] dark:bg-secondary/40 border border-border shadow-2xs">
                <span
                  className="h-3.5 w-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusColors[item.status] || "#9CA3AF" }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate" title={statusLabels[item.status] || item.status}>
                    {statusLabels[item.status] || item.status}
                  </span>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">
                    {item.count} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

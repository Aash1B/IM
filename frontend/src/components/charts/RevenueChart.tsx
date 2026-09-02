"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RevenueOverTimePoint } from "@/types/dashboard";
import { formatCurrencyINR } from "@/lib/utils";

interface RevenueChartProps {
  data: RevenueOverTimePoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const axisColor = isDark ? "#E5E7EB" : "#6F6A63";
  const gridColor = isDark ? "#374151" : "#E8E0D5";

  return (
    <div className="rounded-3xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-4 sm:p-6 md:p-8 shadow-2xs">
      <div className="pb-4 sm:pb-5 border-b border-secondary">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Revenue Over Time</h3>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-normal mt-0.5 sm:mt-1">
          Daily revenue generated (INR)
        </p>
      </div>

      <div className="h-[260px] sm:h-[320px] md:h-[360px] w-full pt-4 sm:pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="brandRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const parts = val.split("-");
                return `${parts[1]}/${parts[2]}`;
              }}
              stroke={axisColor}
              fontSize={13}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={axisColor}
              fontSize={13}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
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
              formatter={(value: any) => [formatCurrencyINR(value), "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#brandRevenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

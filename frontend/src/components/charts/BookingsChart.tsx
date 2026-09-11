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
import { BookingOverTimePoint } from "@/types/dashboard";

interface BookingsChartProps {
  data: BookingOverTimePoint[];
}

export const BookingsChart: React.FC<BookingsChartProps> = ({ data }) => {
  const [range, setRange] = useState<"7D" | "30D">("7D");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const axisColor = isDark ? "#E5E7EB" : "#6F6A63";
  const gridColor = isDark ? "#374151" : "#E8E0D5";

  const chartData = range === "7D" ? data.slice(-7) : data;

  return (
    <div className="rounded-3xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-4 sm:p-6 md:p-8 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-secondary">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Bookings Over Time</h3>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-normal mt-0.5 sm:mt-1">Daily booking volume</p>
        </div>
        <div className="flex items-center rounded-full bg-[#FFF4E8] dark:bg-secondary/40 p-1 border border-border self-start sm:self-auto">
          <button
            onClick={() => setRange("7D")}
            className={`px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-medium rounded-full transition-all ${
              range === "7D" ? "bg-[#F98513] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setRange("30D")}
            className={`px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-medium rounded-full transition-all ${
              range === "30D" ? "bg-[#F98513] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30D
          </button>
        </div>
      </div>

      <div className="h-[260px] sm:h-[320px] md:h-[360px] w-full pt-4 sm:pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="brandBookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F98513" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F98513" stopOpacity={0.0} />
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
            <YAxis stroke={axisColor} fontSize={13} fontWeight={700} tickLine={false} axisLine={false} />
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
              formatter={(value: any) => [`${value} bookings`, "Bookings"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#F98513"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#brandBookingsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

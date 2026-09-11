"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { ServiceBreakdownItem } from "@/types/dashboard";

interface ServiceBarChartProps {
  data: ServiceBreakdownItem[];
}

export const ServiceBarChart: React.FC<ServiceBarChartProps> = ({ data }) => {
  const [yAxisWidth, setYAxisWidth] = useState(120);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 1024) setYAxisWidth(220);
        else if (window.innerWidth >= 640) setYAxisWidth(160);
        else setYAxisWidth(100);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const textColor = isDark ? "#FFFFFF" : "#171512";
  const subTextColor = isDark ? "#9CA3AF" : "#6F6A63";
  const gridColor = isDark ? "#374151" : "#E8E0D5";

  return (
    <div className="rounded-3xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-4 sm:p-6 md:p-8 shadow-2xs">
      <div className="pb-4 sm:pb-5 border-b border-secondary">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Service Breakdown</h3>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-normal mt-0.5 sm:mt-1">
          Most requested service categories
        </p>
      </div>

      <div className="h-[440px] sm:h-[520px] md:h-[600px] w-full pt-4 sm:pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 10, left: -5, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis type="number" stroke={subTextColor} fontSize={11} fontWeight={500} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="category"
              type="category"
              stroke={textColor}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
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
              formatter={(value: any) => [`${value} bookings`, "Volume"]}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#F98513" : isDark ? (index === 1 ? "#6B7280" : "#4B5563") : (index === 1 ? "#171512" : "#938C82")}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

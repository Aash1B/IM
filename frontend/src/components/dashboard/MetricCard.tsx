import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconColor = "bg-white dark:bg-card text-sky-500 dark:text-sky-400 border border-border shadow-2xs",
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-4 sm:p-5 md:p-6 shadow-2xs hover:border-[#F98513]/40 hover:shadow-md transition-all group flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3 min-[420px]:gap-4 overflow-hidden",
        className
      )}
    >
      {/* Top / Left: Icon Box + Title */}
      <div className="flex items-center gap-3 min-[420px]:gap-4 min-w-0 flex-1">
        <div className={cn("flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-2xs", iconColor)}>
          {icon}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs sm:text-sm md:text-base font-semibold text-foreground leading-snug truncate" title={title}>
            {title}
          </span>
        </div>
      </div>

      {/* Bottom / Right: Hero Value */}
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F98513] tracking-tight shrink-0 min-[420px]:text-right whitespace-nowrap">
        {value}
      </div>
    </div>
  );
};

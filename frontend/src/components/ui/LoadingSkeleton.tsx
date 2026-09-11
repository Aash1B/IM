import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div className={cn("animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-800/80", className)} style={style} />
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
    <div className="mt-3">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full space-y-3 p-4">
    <div className="flex justify-between pb-2 border-b border-border">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs h-[300px] flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex items-end justify-between gap-2 h-44 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="w-full rounded-t-md" style={{ height: `${20 + (i * 12) % 70}%` }} />
      ))}
    </div>
  </div>
);

import React from "react";
import { BookingStatus } from "@/types/booking";
import { MechanicStatus } from "@/types/mechanic";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: BookingStatus | MechanicStatus | string;
  type?: "booking" | "mechanic";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "booking",
  size = "md",
  className,
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Booking Statuses
      case "PENDING":
        return {
          bg: "bg-red-500/15 text-red-800 dark:text-red-400 border-red-500/40",
          dot: "bg-red-600",
          label: "Pending",
        };
      case "ASSIGNED":
        return {
          bg: "bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-500/40",
          dot: "bg-amber-600",
          label: "Assigned",
        };
      case "MECHANIC_ON_THE_WAY":
        return {
          bg: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/40",
          dot: "bg-sky-500 animate-pulse",
          label: "Mechanic On The Way",
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-purple-500/15 text-purple-950 dark:text-purple-300 border-purple-500/40",
          dot: "bg-purple-600 animate-ping",
          label: "In Progress",
        };
      case "COMPLETED":
        return {
          bg: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-500",
          label: "Completed",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-500/10 text-rose-900 dark:text-rose-300 border-rose-500/30",
          dot: "bg-rose-500",
          label: "Cancelled",
        };

      // Mechanic Statuses
      case "AVAILABLE":
        return {
          bg: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-500",
          label: "Available",
        };
      case "ON_THE_WAY":
        return {
          bg: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/40",
          dot: "bg-sky-500 animate-pulse",
          label: "On The Way",
        };
      case "BUSY":
        return {
          bg: "bg-purple-500/15 text-purple-950 dark:text-purple-300 border-purple-500/40",
          dot: "bg-purple-600",
          label: "Busy",
        };
      case "OFFLINE":
        return {
          bg: "bg-secondary text-muted-foreground border-border",
          dot: "bg-[#6F6A63]",
          label: "Offline",
        };

      default:
        return {
          bg: "bg-secondary text-foreground border-border",
          dot: "bg-[#6F6A63]",
          label: status,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all whitespace-nowrap shadow-2xs",
        style.bg,
        size === "sm" && "px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold",
        size === "md" && "px-3 py-1 text-xs sm:text-sm font-semibold",
        size === "lg" && "px-4 py-1.5 text-sm sm:text-base font-semibold",
        className
      )}
    >
      <span className={cn(size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", "rounded-full shrink-0", style.dot)} />
      {style.label}
    </span>
  );
};

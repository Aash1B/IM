import React from "react";
import { Check, Clock, Truck, Wrench, CheckCircle, XCircle } from "lucide-react";
import { BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

interface BookingTimelineProps {
  status: BookingStatus;
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({ status }) => {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center text-rose-800">
        <div className="flex items-center justify-center gap-2 font-bold text-sm">
          <XCircle className="h-5 w-5 text-rose-600" />
          Booking Cancelled
        </div>
        <p className="text-xs text-rose-600 mt-1">This booking request was cancelled.</p>
      </div>
    );
  }

  const steps = [
    { key: "PENDING", label: "Pending", icon: Clock },
    { key: "ASSIGNED", label: "Assigned", icon: Check },
    { key: "MECHANIC_ON_THE_WAY", label: "On The Way", icon: Truck },
    { key: "IN_PROGRESS", label: "In Progress", icon: Wrench },
    { key: "COMPLETED", label: "Completed", icon: CheckCircle },
  ];

  const statusOrder: Record<string, number> = {
    PENDING: 1,
    ASSIGNED: 2,
    MECHANIC_ON_THE_WAY: 3,
    IN_PROGRESS: 4,
    COMPLETED: 5,
  };

  const currentStepNum = statusOrder[status] || 1;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs overflow-hidden">
      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5 sm:mb-6">
        Operational Status Timeline
      </h3>

      <div className="w-full overflow-x-auto pb-2">
        <div className="relative flex items-center justify-between min-w-[540px] px-6">
          {/* Connecting Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-secondary z-0" />
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-1.5 bg-[#F25C05] transition-all duration-500 z-0"
            style={{
              width: `calc(${((currentStepNum - 1) / (steps.length - 1)) * 100}% - 32px)`,
            }}
          />

          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStepNum;
            const isCurrent = stepNum === currentStepNum;
            const Icon = step.icon;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center group">
                <div
                  className={cn(
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all shadow-xs",
                    isDone && "border-[#F25C05] bg-[#F25C05] text-white",
                    isCurrent && "border-[#F25C05] bg-card text-[#F25C05] ring-4 ring-[#F25C05]/20 animate-pulse",
                    !isDone && !isCurrent && "border-border bg-card text-muted-foreground"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <span
                  className={cn(
                    "mt-2.5 text-xs sm:text-sm font-semibold text-center whitespace-nowrap",
                    isCurrent ? "text-[#F25C05]" : isDone ? "text-foreground" : "text-muted-foreground font-normal"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

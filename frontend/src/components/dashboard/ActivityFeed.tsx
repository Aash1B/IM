import React from "react";
import { ActivityNotification } from "@/types/dashboard";
import { CheckCircle2, AlertCircle, UserCheck, Wrench, Clock, Activity } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: ActivityNotification[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING_COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case "BOOKING_CREATED":
        return <AlertCircle className="h-5 w-5 text-[#F98513]" />;
      case "MECHANIC_ASSIGNED":
        return <UserCheck className="h-5 w-5 text-blue-600" />;
      case "MECHANIC_STATUS":
        return <Wrench className="h-5 w-5 text-amber-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getBgStyle = (type: string, isRead?: boolean) => {
    if (type === "BOOKING_CREATED") return "bg-[#FFF4E8] dark:bg-secondary/40 border-border";
    return "bg-card border-border";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3.5">
          <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-[#F98513]" />
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Dispatch & Activity Stream
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/40 px-3.5 py-1 text-xs sm:text-sm font-semibold text-red-800 dark:text-red-400 uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="space-y-3.5">
        {activities.length === 0 ? (
          <p className="p-8 text-center text-base sm:text-lg font-medium text-muted-foreground">
            No recent activity logged.
          </p>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 sm:gap-5 rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all group",
                getBgStyle(item.type, item.isRead)
              )}
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-card shadow-xs border border-border">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                <p className="text-base sm:text-lg font-medium text-foreground group-hover:text-[#F98513] transition-colors leading-snug truncate">
                  {item.title && item.title !== "Booking Update" ? `${item.title}: ` : ""}
                  {item.message}
                </p>
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap shrink-0">
                  {formatTimeAgo(item.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

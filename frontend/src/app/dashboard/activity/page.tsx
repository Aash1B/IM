"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { RefreshCw } from "lucide-react";

export default function ActivityStreamPage() {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  // Map notifications to ActivityNotification format
  const activities = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    isRead: n.isRead,
  }));

  return (
    <div className="space-y-6 pt-2">

      {/* Main Activity Feed */}
      {loading && !activities.length ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xs">
          <ActivityFeed activities={activities} />
        </div>
      )}
    </div>
  );
}

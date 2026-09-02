"use client";

import React, { useState } from "react";
import { useBookings } from "@/hooks/useBookings";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { RefreshCw, CalendarCheck } from "lucide-react";

export default function BookingsPage() {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  });

  const { bookings, pagination, loading, error, refresh } = useBookings(params);

  const handleFilterChange = (newParams: any) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6 pt-2">

      {/* Main Bookings Data Component */}
      {loading && !bookings.length ? (
        <TableSkeleton />
      ) : (
        <BookingsTable
          bookings={bookings}
          pagination={pagination}
          params={params}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          exportUrl="/api/bookings/export"
          loading={loading}
        />
      )}
    </div>
  );
}

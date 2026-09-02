"use client";

import React from "react";
import { useMechanics } from "@/hooks/useMechanics";
import { MechanicsGrid } from "@/components/mechanics/MechanicsGrid";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { RefreshCw } from "lucide-react";

export default function MechanicsPage() {
  const {
    mechanics,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    refresh
  } = useMechanics();

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6 pt-2">

      {/* Mechanics Grid Roster */}
      {loading && !mechanics.length ? (
        <TableSkeleton />
      ) : (
        <MechanicsGrid
          mechanics={mechanics}
          pagination={pagination}
          params={params}
          onFilterChange={updateFilters}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </div>
  );
}

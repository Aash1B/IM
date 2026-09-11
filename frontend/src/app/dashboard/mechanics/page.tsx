"use client";

import React, { useState } from "react";
import { useMechanics } from "@/hooks/useMechanics";
import { MechanicsGrid } from "@/components/mechanics/MechanicsGrid";
import { NewMechanicModal } from "@/components/mechanics/NewMechanicModal";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

export default function MechanicsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    mechanics,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    refresh
  } = useMechanics({ page: 1, limit: 9 });

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
          onAddMechanic={() => setIsModalOpen(true)}
        />
      )}

      {/* Add Mechanic Modal */}
      <NewMechanicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMechanicCreated={() => refresh()}
      />
    </div>
  );
}

"use client";

import React from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { ErrorState } from "@/components/ui/ErrorState";

export default function CustomersPage() {
  const {
    customers,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    refresh,
  } = useCustomers({ page: 1, limit: 10 });

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6 pt-2">

      <CustomersTable
        customers={customers}
        pagination={pagination}
        params={params}
        onFilterChange={updateFilters}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { NewCustomerModal } from "@/components/customers/NewCustomerModal";
import { ErrorState } from "@/components/ui/ErrorState";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    customers,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    refresh,
  } = useCustomers({ page: 1, limit: 9 });

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
        onAddCustomer={() => setIsModalOpen(true)}
      />

      {/* Add Customer Modal */}
      <NewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCustomerCreated={() => refresh()}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Customer, CustomerFilterParams, Pagination } from "../types/customer";
import { customerService } from "../services/customer.service";

export function useCustomers(initialParams: CustomerFilterParams = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [params, setParams] = useState<CustomerFilterParams>(initialParams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomers(params);
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const updateFilters = (newParams: Partial<CustomerFilterParams>) => {
    setParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page !== undefined ? newParams.page : 1,
    }));
  };

  const setPage = (page: number) => {
    setParams(prev => ({ ...prev, page }));
  };

  return {
    customers,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    refresh: fetchCustomers,
  };
}

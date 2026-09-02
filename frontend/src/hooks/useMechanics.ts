"use client";

import { useState, useEffect, useCallback } from "react";
import { Mechanic, MechanicFilterParams, Pagination, MechanicLocationItem } from "../types/mechanic";
import { mechanicService } from "../services/mechanic.service";

export function useMechanics(initialParams: MechanicFilterParams = {}) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [locations, setLocations] = useState<MechanicLocationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [params, setParams] = useState<MechanicFilterParams>(initialParams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMechanics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mechanicService.getMechanics(params);
      setMechanics(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load mechanics");
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await mechanicService.getMechanicLocations();
      setLocations(res.data);
    } catch (err: any) {
      console.error("Failed to load locations", err);
    }
  }, []);

  useEffect(() => {
    fetchMechanics();
  }, [fetchMechanics]);

  const updateFilters = (newParams: Partial<MechanicFilterParams>) => {
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
    mechanics,
    locations,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    fetchLocations,
    refresh: fetchMechanics,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Booking, BookingFilterParams, Pagination, BookingStatus } from "../types/booking";
import { bookingService } from "../services/booking.service";

export function useBookings(initialParams: BookingFilterParams = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [params, setParams] = useState<BookingFilterParams>(initialParams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookings(params);
      setBookings(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateFilters = (newParams: Partial<BookingFilterParams>) => {
    setParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page !== undefined ? newParams.page : 1, // Reset to page 1 on filter changes
    }));
  };

  const setPage = (page: number) => {
    setParams(prev => ({ ...prev, page }));
  };

  const updateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await fetchBookings();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    bookings,
    pagination,
    params,
    loading,
    error,
    updateFilters,
    setPage,
    updateStatus,
    refresh: fetchBookings,
    getExportUrl: () => bookingService.getExportUrl(params),
  };
}

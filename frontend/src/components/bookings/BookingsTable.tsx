"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Clock,
  LayoutList,
  Table as TableIcon,
} from "lucide-react";
import { Booking, BookingFilterParams, Pagination, BookingStatus } from "@/types/booking";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

interface BookingsTableProps {
  bookings: Booking[];
  pagination: Pagination;
  params: BookingFilterParams;
  onFilterChange: (params: Partial<BookingFilterParams>) => void;
  onPageChange: (page: number) => void;
  exportUrl?: string;
  loading?: boolean;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  pagination,
  params,
  onFilterChange,
  onPageChange,
  exportUrl,
  loading,
}) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const handleSort = (field: string) => {
    const isAsc = params.sortBy === field && params.sortOrder === "asc";
    onFilterChange({
      sortBy: field,
      sortOrder: isAsc ? "desc" : "asc",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar Header inspired by SehatSetu layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card bg-brand-grid dark:bg-dark-grid p-5 rounded-2xl border border-border shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, customer, vehicle reg, service..."
            value={params.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full rounded-xl border border-border bg-secondary py-3 pl-12 pr-5 text-base md:text-lg font-normal text-foreground placeholder-gray-400 focus:border-[#F98513] focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#F98513]/20"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={params.status || ""}
            onChange={(e) => onFilterChange({ status: e.target.value as BookingStatus })}
            className="rounded-xl border border-border bg-secondary px-5 py-3 text-base md:text-lg font-medium text-foreground focus:border-[#F98513] focus:outline-none shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="MECHANIC_ON_THE_WAY">Mechanic On The Way</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={params.serviceId || ""}
            onChange={(e) => onFilterChange({ serviceId: e.target.value })}
            className="rounded-xl border border-border bg-secondary px-5 py-3 text-base md:text-lg font-medium text-foreground focus:border-[#F98513] focus:outline-none shadow-2xs"
          >
            <option value="">All Services</option>
            <option value="AC">AC Repair</option>
            <option value="Engine">Engine</option>
            <option value="Brakes">Brakes</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Suspension">Suspension</option>
            <option value="Electrical">Electrical</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-secondary p-1 border border-border">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "card" ? "bg-[#F98513] text-white shadow-xs" : "text-muted-foreground hover:text-gray-900"
              }`}
              title="Card Rows View"
            >
              <LayoutList className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "table" ? "bg-[#F98513] text-white shadow-xs" : "text-muted-foreground hover:text-gray-900"
              }`}
              title="Data Table View"
            >
              <TableIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Export CSV Trigger */}
          {exportUrl && (
            <a
              href={exportUrl}
              download="bookings-export.csv"
              className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm md:text-base font-bold text-foreground hover:bg-secondary transition-colors shadow-2xs"
            >
              <Download className="h-5 w-5 text-[#F98513]" />
              Export
            </a>
          )}
        </div>
      </div>

      {/* Card Rows List View */}
      {viewMode === "card" ? (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-border bg-card p-5 animate-pulse" />
            ))
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-base font-extrabold border border-dashed border-border rounded-2xl">
              No bookings matching current criteria.
            </div>
          ) : (
            bookings.map((b) => {
              const customerInitials = b.customer.name
                ? b.customer.name.split(" ").map((n) => n[0]).join("").substring(0, 2)
                : "BK";

              return (
                <div
                  key={b.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-5 md:p-6 shadow-2xs hover:border-[#F98513]/40 hover:shadow-md transition-all group"
                >
                  {/* Left: Circular Dark Avatar Badge + Vertical Line Divider + Name + Status Badge */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#171512] text-white font-black text-base shadow-2xs shrink-0">
                      {customerInitials}
                    </div>

                    <div className="h-8 w-px bg-[#E8E0D5] shrink-0" />

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-bold text-foreground group-hover:text-[#F98513] transition-colors">
                          {b.customer.name}
                        </span>
                        <StatusBadge status={b.status} type="booking" size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground mt-1">
                        <span className="text-[#F98513] font-bold">{b.bookingNumber}</span>
                        <span>•</span>
                        <span>{b.service.name}</span>
                        <span>•</span>
                        <span>{b.vehicle.make} {b.vehicle.model} ({b.vehicle.registrationNumber})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Date/Time + Amount + Action Buttons */}
                  <div className="flex items-center gap-4 border-t md:border-t-0 border-secondary pt-3 md:pt-0 justify-between md:justify-end">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(b.scheduledAt)}</span>
                    </div>

                    <div className="text-xl font-bold text-foreground">
                      {formatCurrencyINR(b.amount)}
                    </div>

                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#171512] px-5 py-2.5 text-xs md:text-sm font-bold text-white hover:bg-black transition-colors shadow-xs shrink-0"
                    >
                      <Eye className="h-4 w-4 text-[#F98513]" /> View Details
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Data Table View */
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
          <table className="w-full text-left text-base">
            <thead className="bg-secondary text-foreground font-semibold uppercase tracking-wider border-b border-border text-xs md:text-sm">
              <tr>
                <th className="py-4.5 px-6 cursor-pointer" onClick={() => handleSort("bookingNumber")}>
                  <div className="flex items-center gap-2">
                    Booking ID <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="py-4.5 px-6 cursor-pointer" onClick={() => handleSort("customerName")}>
                  <div className="flex items-center gap-2">
                    Customer <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="py-4.5 px-6">Vehicle</th>
                <th className="py-4.5 px-6">Service</th>
                <th className="py-4.5 px-6">Mechanic</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 cursor-pointer" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-2">
                    Amount <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="py-4.5 px-6 cursor-pointer" onClick={() => handleSort("scheduledAt")}>
                  <div className="flex items-center gap-2">
                    Date/Time <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="py-4.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8] font-normal text-foreground">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#FFF4E8] dark:hover:bg-secondary/30 transition-colors">
                  <td className="py-5 px-6 font-bold text-[#F98513] text-lg">{b.bookingNumber}</td>
                  <td className="py-5 px-6 font-bold">{b.customer.name}</td>
                  <td className="py-5 px-6">{b.vehicle.make} {b.vehicle.model}</td>
                  <td className="py-5 px-6">{b.service.name}</td>
                  <td className="py-5 px-6">{b.mechanic ? b.mechanic.name : "Unassigned"}</td>
                  <td className="py-5 px-6"><StatusBadge status={b.status} type="booking" size="sm" /></td>
                  <td className="py-5 px-6 font-bold">{formatCurrencyINR(b.amount)}</td>
                  <td className="py-5 px-6 text-xs md:text-sm">{formatDate(b.scheduledAt)}</td>
                  <td className="py-5 px-6 text-right">
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground hover:bg-[#F98513] hover:text-white transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-2xs text-sm md:text-base font-medium">
        <span className="text-muted-foreground">
          Showing page <span className="font-bold text-foreground">{pagination.page}</span> of{" "}
          <span className="font-bold text-foreground">{pagination.totalPages}</span> ({pagination.total} total bookings)
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary hover:border-[#F98513] transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4.5 w-4.5" /> Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary hover:border-[#F98513] transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

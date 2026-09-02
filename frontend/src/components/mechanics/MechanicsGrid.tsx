"use client";

import React from "react";
import Link from "next/link";
import { Mechanic, MechanicFilterParams, Pagination, MechanicStatus } from "@/types/mechanic";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Phone, Mail, CheckCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface MechanicsGridProps {
  mechanics: Mechanic[];
  pagination?: Pagination;
  params?: MechanicFilterParams;
  onFilterChange?: (params: Partial<MechanicFilterParams>) => void;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export const MechanicsGrid: React.FC<MechanicsGridProps> = ({
  mechanics = [],
  pagination = { page: 1, limit: 10, total: mechanics.length, totalPages: 1 },
  params = {},
  onFilterChange = () => {},
  onPageChange = () => {},
  loading,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between bg-card bg-brand-grid dark:bg-dark-grid p-4 sm:p-5 md:p-6 rounded-2xl border border-border shadow-2xs">
        <div className="relative flex-1 max-w-full sm:max-w-lg">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 h-4.5 w-4.5 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mechanic name, email, phone..."
            value={params?.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full rounded-xl border border-border bg-secondary py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base md:text-lg font-bold text-foreground placeholder-gray-400 focus:border-[#F98513] focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#F98513]/20"
          />
        </div>

        <select
          value={params?.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value as MechanicStatus })}
          className="w-full sm:w-auto rounded-xl border border-border bg-secondary px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-base md:text-lg font-medium text-foreground focus:border-[#F98513] focus:outline-none shadow-2xs"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="ON_THE_WAY">On The Way</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Grid of Mechanic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-border bg-card p-6 animate-pulse" />
          ))
        ) : mechanics.length === 0 ? (
          <div className="col-span-full p-8 sm:p-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl font-medium text-sm sm:text-base">
            No mechanics match current filters.
          </div>
        ) : (
          mechanics.map((m) => (
            <div
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card bg-brand-grid dark:bg-dark-grid p-5 sm:p-6 md:p-7 shadow-2xs hover:border-[#F98513]/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#171512] text-white font-bold text-2xl sm:text-3xl shadow-md shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl sm:text-2xl md:text-3xl font-poppins font-medium text-foreground group-hover:text-[#F98513] transition-colors leading-tight truncate">
                        {m.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-sm sm:text-base text-emerald-800 font-bold mt-1">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                        <span>{m.jobsCompleted} jobs completed</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={m.status} type="mechanic" size="md" />
                </div>

                <div className="mt-5 space-y-2.5 text-sm sm:text-base text-foreground border-t border-secondary pt-4">
                  <div className="flex items-center gap-3 font-medium">
                    <Phone className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                    <span>{m.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 font-medium">
                    <Mail className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  {m.currentBooking && (
                    <div className="mt-3.5 rounded-xl bg-[#FFF4E8] dark:bg-secondary/40 p-3 text-sm sm:text-base font-semibold text-[#F98513] border border-[#F98513]/30 truncate">
                      Active Job: {m.currentBooking.bookingNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-secondary flex items-center justify-between">
                <span className="text-xs sm:text-sm text-[#938C82] font-mono font-medium truncate">ID: {m.id}</span>
                <Link
                  href={`/dashboard/mechanics/${m.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 sm:px-5 py-2.5 text-sm sm:text-base font-bold text-foreground hover:bg-[#F98513] hover:text-white hover:border-[#F98513] transition-all shadow-2xs shrink-0 min-h-[42px]"
                >
                  <Eye className="h-4.5 w-4.5" />
                  View Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-2xs text-sm sm:text-base font-medium">
        <span className="text-muted-foreground text-center sm:text-left">
          Page <span className="font-bold text-foreground">{pagination.page}</span> of{" "}
          <span className="font-bold text-foreground">{pagination.totalPages}</span> ({pagination.total} total mechanics)
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-2 rounded-xl border border-border px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground hover:bg-secondary hover:border-[#F98513] transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[42px]"
          >
            <ChevronLeft className="h-5 w-5" /> Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-2 rounded-xl border border-border px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground hover:bg-secondary hover:border-[#F98513] transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[42px]"
          >
            Next <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Customer, CustomerFilterParams, Pagination } from "@/types/customer";
import { Search, ChevronLeft, ChevronRight, Mail, Phone, Calendar } from "lucide-react";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

interface CustomersTableProps {
  customers: Customer[];
  pagination: Pagination;
  params: CustomerFilterParams;
  onFilterChange: (params: Partial<CustomerFilterParams>) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  pagination,
  params,
  onFilterChange,
  onPageChange,
  loading,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-2xs">
        <div className="relative flex-1 max-w-full lg:max-w-lg">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer name, email, phone..."
            value={params.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full rounded-xl border border-border bg-secondary py-3 sm:py-3.5 pl-12 pr-5 text-base sm:text-lg font-bold text-foreground placeholder-gray-400 focus:border-[#FF5A00] focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20"
          />
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="w-full overflow-x-auto min-w-0 rounded-2xl border border-border bg-card shadow-2xs">
        <table className="w-full text-left text-base sm:text-lg min-w-[760px]">
          <thead className="bg-secondary text-foreground font-semibold uppercase tracking-wider border-b border-border text-xs sm:text-sm">
            <tr>
              <th className="py-4.5 px-6">Customer</th>
              <th className="py-4.5 px-6">Contact Info</th>
              <th className="py-4.5 px-6">Total Bookings</th>
              <th className="py-4.5 px-6">Total Spent</th>
              <th className="py-4.5 px-6">Customer Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F0E8] font-normal text-foreground text-sm sm:text-base">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-5 px-6"><div className="h-6 w-44 bg-gray-200 rounded" /></td>
                  <td className="py-5 px-6"><div className="h-6 w-52 bg-gray-200 rounded" /></td>
                  <td className="py-5 px-6"><div className="h-6 w-24 bg-gray-200 rounded" /></td>
                  <td className="py-5 px-6"><div className="h-6 w-28 bg-gray-200 rounded" /></td>
                  <td className="py-5 px-6"><div className="h-6 w-32 bg-gray-200 rounded" /></td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground text-base sm:text-lg font-medium">
                  No customer records found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFF7EA] dark:hover:bg-secondary/30 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#171512] text-white font-bold text-base sm:text-xl shadow-2xs shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-poppins font-bold text-foreground text-lg sm:text-xl block">{c.name}</span>
                        <span className="text-xs text-muted-foreground font-mono font-normal">ID: {c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-1.5 text-sm sm:text-base text-foreground">
                      <span className="flex items-center gap-2 font-medium">
                        <Mail className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
                        <Phone className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                        <span>{c.phone}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-poppins font-semibold text-sky-500 dark:text-sky-400 text-base sm:text-lg md:text-xl">
                    {c.totalBookings} bookings
                  </td>
                  <td className="py-5 px-6 font-poppins font-bold text-foreground text-lg sm:text-xl">
                    {formatCurrencyINR(c.totalSpent)}
                  </td>
                  <td className="py-5 px-6 text-muted-foreground text-xs sm:text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                      {formatDate(c.createdAt)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-2xs text-sm sm:text-base font-medium">
        <span className="text-muted-foreground text-center sm:text-left">
          Page <span className="font-bold text-foreground">{pagination.page}</span> of{" "}
          <span className="font-bold text-foreground">{pagination.totalPages}</span> ({pagination.total} total customers)
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-2 rounded-xl border border-border px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground disabled:opacity-40 hover:bg-secondary shadow-2xs min-h-[42px] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" /> Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-2 rounded-xl border border-border px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground disabled:opacity-40 hover:bg-secondary shadow-2xs min-h-[42px] cursor-pointer"
          >
            Next <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

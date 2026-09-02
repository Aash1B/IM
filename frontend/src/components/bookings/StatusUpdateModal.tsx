"use client";

import React, { useState } from "react";
import { BookingStatus } from "@/types/booking";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { X, RefreshCw } from "lucide-react";

interface StatusUpdateModalProps {
  isOpen: boolean;
  currentStatus: BookingStatus;
  onClose: () => void;
  onUpdateStatus: (newStatus: BookingStatus) => Promise<void>;
}

const statusOptions: { status: BookingStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "ASSIGNED", label: "Assigned" },
  { status: "MECHANIC_ON_THE_WAY", label: "Mechanic On The Way" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "COMPLETED", label: "Completed" },
  { status: "CANCELLED", label: "Cancelled" },
];

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  currentStatus,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(currentStatus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onUpdateStatus(selectedStatus);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update booking status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3.5 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl bg-card p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <h3 className="text-base font-bold text-gray-900">Update Booking Status</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-gray-100 hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              Select New Operational Status:
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => (
                <label
                  key={opt.status}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStatus === opt.status
                      ? "border-[#F25C05] bg-orange-50/50 ring-2 ring-[#F25C05]/20"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value={opt.status}
                      checked={selectedStatus === opt.status}
                      onChange={() => setSelectedStatus(opt.status)}
                      className="accent-[#F25C05] h-4 w-4"
                    />
                    <span className="text-xs font-bold text-gray-800">{opt.label}</span>
                  </div>
                  <StatusBadge status={opt.status} size="sm" />
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedStatus === currentStatus}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F25C05] px-4 py-2 text-xs font-bold text-white hover:bg-[#E04F00] disabled:opacity-50 transition-colors shadow-xs"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Status"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

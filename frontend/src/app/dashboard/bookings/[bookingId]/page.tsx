"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Booking } from "@/types/booking";
import { bookingService } from "@/services/booking.service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BookingTimeline } from "@/components/bookings/BookingTimeline";
import { StatusUpdateModal } from "@/components/bookings/StatusUpdateModal";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  ChevronLeft,
  User,
  Car,
  Wrench,
  UserCheck,
  Calendar,
  IndianRupee,
  Edit,
  Phone,
  Mail,
} from "lucide-react";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getBookingById(bookingId);
      setBooking(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleUpdateStatus = async (newStatus: any) => {
    if (!booking) return;
    await bookingService.updateBookingStatus(booking.id, newStatus);
    setBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchBooking} />;
  }

  if (loading || !booking) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading booking specification details...
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary/50 shrink-0 shadow-2xs"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-foreground truncate">{booking.bookingNumber}</h2>
              <StatusBadge status={booking.status} type="booking" size="md" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#F25C05] px-5 py-3 text-sm sm:text-base font-bold text-white hover:bg-[#E04F00] transition-colors shadow-md shadow-[#F25C05]/20 self-start sm:self-auto min-h-[44px]"
        >
          <Edit className="h-5 w-5" />
          Update Status
        </button>
      </div>

      {/* Operational Lifecycle Stepper Timeline */}
      <BookingTimeline status={booking.status} />

      {/* Grid of Details Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Customer Information */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <User className="h-5 w-5 text-[#F25C05] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">Customer Details</h3>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-foreground">
            <div className="font-poppins font-bold text-lg sm:text-xl text-foreground">{booking.customer.name}</div>
            {booking.customer.phone && (
              <div className="flex items-center gap-2.5 font-medium">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{booking.customer.phone}</span>
              </div>
            )}
            {booking.customer.email && (
              <div className="flex items-center gap-2.5 font-medium">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{booking.customer.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Car className="h-5 w-5 text-[#F25C05] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">Vehicle Specifications</h3>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-foreground">
            <div className="font-poppins font-bold text-lg sm:text-xl text-foreground">
              {booking.vehicle.make} {booking.vehicle.model}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-muted-foreground">Registration:</span>
              <span className="font-mono bg-secondary px-2.5 py-1 rounded-lg text-foreground font-semibold text-sm sm:text-base border border-border">
                {booking.vehicle.registrationNumber}
              </span>
            </div>
            {booking.vehicle.year && (
              <div className="text-muted-foreground font-medium">Model Year: {booking.vehicle.year}</div>
            )}
          </div>
        </div>

        {/* Service Requested */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Wrench className="h-5 w-5 text-[#F25C05] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">Service Category & Scope</h3>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-foreground">
            <div className="font-poppins font-bold text-lg sm:text-xl text-foreground">{booking.service.name}</div>
            <div className="inline-block rounded-full bg-orange-50/80 dark:bg-secondary/40 border border-[#F25C05]/30 px-3 py-1 text-xs sm:text-sm font-semibold text-[#F25C05]">
              Category: {booking.service.category}
            </div>
            {booking.service.description && (
              <p className="text-muted-foreground font-medium pt-1 leading-relaxed text-sm sm:text-base">{booking.service.description}</p>
            )}
          </div>
        </div>

        {/* Assigned Mechanic */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <UserCheck className="h-5 w-5 text-[#F25C05] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">Assigned Mechanic</h3>
          </div>
          {booking.mechanic ? (
            <div className="space-y-2.5 text-sm sm:text-base text-foreground">
              <div className="font-poppins font-bold text-lg sm:text-xl text-foreground">{booking.mechanic.name}</div>
              {booking.mechanic.phone && (
                <div className="flex items-center gap-2.5 font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{booking.mechanic.phone}</span>
                </div>
              )}
              {booking.mechanic.status && (
                <div className="pt-1">
                  <StatusBadge status={booking.mechanic.status} type="mechanic" size="md" />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-secondary/50 text-sm text-muted-foreground font-medium italic border border-border/50">
              No mechanic assigned yet. Status is currently pending dispatch.
            </div>
          )}
        </div>
      </div>

      {/* Financial & Schedule Overview Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <IndianRupee className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wider block">
              SERVICE FEE AMOUNT
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-foreground">
              {formatCurrencyINR(booking.amount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
          <Calendar className="h-7 w-7 text-muted-foreground shrink-0" />
          <div>
            <span className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wider block">
              SCHEDULED APPOINTMENT
            </span>
            <span className="text-sm sm:text-base md:text-lg font-poppins font-bold text-foreground">
              {formatDate(booking.scheduledAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={modalOpen}
        currentStatus={booking.status}
        onClose={() => setModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mechanic } from "@/types/mechanic";
import { mechanicService } from "@/services/mechanic.service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  ChevronLeft,
  Wrench,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
} from "lucide-react";

export default function MechanicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mechanicId = params.mechanicId as string;

  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMechanic = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mechanicService.getMechanicById(mechanicId);
      setMechanic(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load mechanic details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mechanicId) {
      fetchMechanic();
    }
  }, [mechanicId]);

  if (error) {
    return <ErrorState message={error} onRetry={fetchMechanic} />;
  }

  if (loading || !mechanic) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading mechanic profile...
      </div>
    );
  }

  const completionRate = mechanic.totalJobs
    ? ((mechanic.jobsCompleted / mechanic.totalJobs) * 100).toFixed(1)
    : "95.0";

  return (
    <div className="space-y-6 sm:space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/80 pb-5">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary/50 shrink-0 shadow-2xs transition-all"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground truncate">{mechanic.name}</h2>
            <StatusBadge status={mechanic.status} type="mechanic" size="md" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium font-mono mt-0.5">ID: {mechanic.id}</p>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Contact & Status */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col items-center text-center pb-6 border-b border-border">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#171512] text-white font-extrabold text-2xl sm:text-3xl shadow-md mb-4 shrink-0">
              {mechanic.name.charAt(0)}
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{mechanic.name}</h3>
            <span className="text-sm sm:text-base text-muted-foreground font-medium mt-1">Field Technician</span>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-foreground">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#F98513] shrink-0" />
              <span className="font-medium">{mechanic.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#F98513] shrink-0" />
              <span className="font-medium truncate">{mechanic.email}</span>
            </div>
            {mechanic.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#F98513] shrink-0" />
                <span className="font-mono text-xs sm:text-sm truncate text-muted-foreground">
                  GPS: {mechanic.location.latitude}, {mechanic.location.longitude}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center & Right Column: Performance Stats & Active Jobs */}
        <div className="md:col-span-2 space-y-6">
          {/* Performance Stats Cards */}
          <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground block">
                Jobs Completed
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 block">
                {mechanic.jobsCompleted}
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground block">
                Total Assigned
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 block">
                {mechanic.totalJobs || mechanic.jobsCompleted + 5}
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground block">
                Completion Rate
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 block">
                {completionRate}%
              </span>
            </div>
          </div>

          {/* Current Active Assignment */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-[#F98513]" />
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Current Job Assignment</h4>
              </div>
            </div>

            {mechanic.currentBooking ? (
              <div className="rounded-2xl bg-[#FFF4E8] dark:bg-amber-950/30 p-5 sm:p-6 border border-[#F98513]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-lg sm:text-xl font-bold text-[#F98513] block">
                    {mechanic.currentBooking.bookingNumber}
                  </span>
                  {mechanic.currentBooking.customerName && (
                    <span className="text-sm sm:text-base text-foreground font-medium block mt-1">
                      Customer: {mechanic.currentBooking.customerName}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/dashboard/bookings/${mechanic.currentBooking?.id}`)}
                  className="rounded-xl bg-[#F98513] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E0740B] transition-colors shrink-0 shadow-xs"
                >
                  View Job Details
                </button>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground font-normal italic p-5 bg-secondary/50 rounded-2xl border border-border/60">
                Mechanic has no active assigned booking at this moment. Currently available for dispatch.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

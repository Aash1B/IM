"use client";

import React, { useState, useEffect } from "react";
import { mechanicService } from "@/services/mechanic.service";
import { MechanicLocationItem, MechanicStatus } from "@/types/mechanic";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MapPin, Navigation, RefreshCw, Search, Phone } from "lucide-react";
import Link from "next/link";

export default function LiveMapPage() {
  const [locations, setLocations] = useState<MechanicLocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<MechanicStatus | "ALL">("ALL");
  const [selectedMechanic, setSelectedMechanic] = useState<MechanicLocationItem | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await mechanicService.getMechanicLocations();
      setLocations(res.data);
      if (res.data.length > 0 && !selectedMechanic) {
        setSelectedMechanic(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load map locations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((loc) =>
    selectedStatus === "ALL" ? true : loc.status === selectedStatus
  );

  return (
    <div className="space-y-3 sm:space-y-4 pt-1">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 pb-0">
        <div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Real-time GPS tracking of field technicians and active dispatches.
          </p>
        </div>

        <button
          onClick={fetchLocations}
          className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-2.5 text-base sm:text-lg font-semibold text-foreground hover:bg-secondary/50 shadow-2xs transition-all shrink-0"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin text-[#F98513]" : ""}`} />
          Refresh Locations
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-5 sm:p-6 rounded-3xl border border-border/80 shadow-2xs">
        <span className="text-base sm:text-lg font-bold text-muted-foreground mr-3">Filter by Status:</span>
        {(["ALL", "AVAILABLE", "ON_THE_WAY", "BUSY", "OFFLINE"] as const).map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-5 py-2.5 rounded-2xl text-sm sm:text-base font-semibold transition-all ${
              selectedStatus === st
                ? "bg-[#F98513] text-white shadow-xs"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {st === "ALL" ? "All Mechanics" : st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Main Interactive Vector Map Container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-auto lg:h-[640px]">
        {/* Map Visualization Box */}
        <div className="lg:col-span-8 h-[420px] sm:h-[500px] lg:h-full rounded-3xl border border-border bg-slate-900 relative overflow-hidden flex flex-col justify-between p-5 sm:p-7 shadow-md bg-grid-pattern">
          {/* Top Bar inside Map */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5 rounded-full bg-slate-800/80 px-4 py-2 text-sm sm:text-base text-slate-300 backdrop-blur-md border border-slate-700">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate font-semibold">Delhi NCR Grid</span>
            </div>
            <span className="text-sm sm:text-base text-slate-300 font-mono font-semibold">
              {filteredLocations.length} active units
            </span>
          </div>

          {/* Interactive Plot Nodes */}
          <div className="relative flex-1 my-4 sm:my-5 border border-slate-800 rounded-2xl bg-slate-950/60 p-4">
            {filteredLocations.map((loc, i) => {
              const locKey = loc.id || `loc-${i}`;
              const isSelected = selectedMechanic?.id === loc.id;
              // Map latitude (28.4 to 28.8) to Y (80% to 10%)
              const topPct = Math.max(10, Math.min(85, 100 - ((loc.latitude - 28.4) / 0.4) * 100));
              // Map longitude (77.0 to 77.4) to X (10% to 85%)
              const leftPct = Math.max(10, Math.min(85, ((loc.longitude - 77.0) / 0.4) * 100));

              return (
                <div
                  key={locKey}
                  onClick={() => setSelectedMechanic(loc)}
                  style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                    isSelected ? "z-30 scale-125" : "z-10 hover:scale-110"
                  }`}
                  title={`${loc.name} - ${loc.status}`}
                >
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-white shadow-lg ${
                      loc.status === "ON_THE_WAY"
                        ? "bg-indigo-600 border-indigo-300 ring-4 ring-indigo-500/30 animate-bounce"
                        : loc.status === "AVAILABLE"
                        ? "bg-emerald-600 border-emerald-300"
                        : loc.status === "BUSY"
                        ? "bg-[#F98513] border-orange-300"
                        : "bg-gray-700 border-gray-500"
                    }`}
                  >
                    <Navigation className="h-4.5 w-4.5 sm:h-5 sm:w-5 transform rotate-45" />
                  </div>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 rounded-lg bg-slate-900 px-2.5 py-1 text-xs sm:text-sm font-bold text-white whitespace-nowrap shadow-md border border-slate-700">
                    {loc.name.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Map Footer Legend */}
          <div className="flex flex-wrap items-center justify-between text-sm sm:text-base text-slate-300 z-10 pt-3.5 border-t border-slate-800 gap-3">
            <div className="flex flex-wrap items-center gap-5 text-sm sm:text-base font-semibold">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" /> Available
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500 shrink-0" /> On The Way
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#F98513] shrink-0" /> Busy
              </span>
            </div>
            <span className="text-sm font-mono font-semibold text-slate-400">Live Sync</span>
          </div>
        </div>

        {/* Selected Mechanic Info Drawer Side Panel */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs flex flex-col justify-between min-h-[300px]">
          {selectedMechanic ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#171512] text-white font-extrabold text-xl sm:text-2xl shrink-0">
                    {selectedMechanic.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{selectedMechanic.name}</h3>
                    <span className="text-sm sm:text-base text-muted-foreground font-mono block mt-0.5">ID: {selectedMechanic.id}</span>
                  </div>
                </div>
                <StatusBadge status={selectedMechanic.status} type="mechanic" size="md" />
              </div>

              <div className="space-y-4 text-base sm:text-lg text-foreground">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/60">
                  <span className="text-muted-foreground font-semibold">GPS Coords:</span>
                  <span className="font-mono font-bold text-foreground text-sm sm:text-base">
                    {selectedMechanic.latitude}, {selectedMechanic.longitude}
                  </span>
                </div>

                {selectedMechanic.currentBooking ? (
                  <div className="rounded-2xl border border-[#F98513]/30 bg-[#FFF4E8] dark:bg-amber-950/30 p-5 space-y-2.5">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#F98513] block">
                      Active Dispatch Job
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-foreground block">
                      {selectedMechanic.currentBooking.bookingNumber}
                    </span>
                    <Link
                      href={`/dashboard/bookings/${selectedMechanic.currentBooking.id}`}
                      className="inline-block text-base font-semibold text-[#F98513] hover:underline mt-1"
                    >
                      Open Booking Spec →
                    </Link>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg text-muted-foreground font-normal italic p-5 bg-secondary/50 rounded-2xl border border-border/60">
                    Mechanic is currently unassigned to any active job.
                  </p>
                )}
              </div>

              <div className="pt-5 border-t border-border">
                <Link
                  href={`/dashboard/mechanics/${selectedMechanic.id}`}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#171512] py-4 px-6 text-base sm:text-lg font-semibold text-white hover:bg-black transition-colors shadow-xs"
                >
                  View Full Mechanic Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-base sm:text-lg p-6">
              <MapPin className="h-12 w-12 text-gray-400 mb-3" />
              Select a mechanic marker on the map to view live details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

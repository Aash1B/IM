"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6 pt-2">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* User Profile Card */}
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-2xs space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-3.5 pb-4 border-b border-secondary">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#FFF4E8] dark:bg-secondary/40 text-[#F98513] shrink-0">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">
              Logged-in Administrator Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-1">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#938C82] block mb-1">
                NAME
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-bold text-foreground block">
                {user?.name || "Admin User"}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#938C82] block mb-1">
                EMAIL
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-bold text-foreground font-mono block truncate">
                {user?.email || "admin@instantmechanic.com"}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#938C82] block mb-1">
                ASSIGNED ROLE
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF4E8] dark:bg-secondary/40 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm md:text-base font-semibold text-[#F98513] border border-[#F98513]/30">
                {user?.role || "ADMIN"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

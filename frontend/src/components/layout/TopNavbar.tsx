"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  User as UserIcon,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleNavbarRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    setTimeout(() => setRefreshing(false), 800);
  };

  const getPageTitle = () => {
    if (pathname.includes("/dashboard/overview")) return "OPERATIONS CONTROL CENTER";
    if (pathname.includes("/dashboard/analytics")) return "ANALYTICS";
    if (pathname.includes("/dashboard/bookings/")) return "BOOKING SPECIFICATIONS";
    if (pathname.includes("/dashboard/bookings")) return "BOOKINGS";
    if (pathname.includes("/dashboard/mechanics/")) return "MECHANIC PROFILE";
    if (pathname.includes("/dashboard/mechanics")) return "MECHANICS";
    if (pathname.includes("/dashboard/services")) return "SERVICES";
    if (pathname.includes("/dashboard/customers")) return "CUSTOMERS";
    if (pathname.includes("/dashboard/map")) return "LIVE OPERATIONS MAP";
    if (pathname.includes("/dashboard/activity")) return "LIVE ACTIVITY STREAM";
    if (pathname.includes("/dashboard/settings")) return "PROFILE & INFO";
    return "OPERATIONS CENTER";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 sm:h-20 w-full items-center justify-between border-b border-border bg-card/95 px-3.5 sm:px-6 md:px-10 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-primary/5 md:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Center: Portal Header */}
      <div className="text-center px-2 min-w-0 flex-1">
        <h1 className="text-xs sm:text-base md:text-xl font-bold md:font-semibold text-foreground tracking-wider md:tracking-widest uppercase truncate max-w-[150px] min-[400px]:max-w-[220px] sm:max-w-none mx-auto">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: User Profile Badge & Refresh Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={handleNavbarRefresh}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-primary/5 active:scale-[0.98] transition-all shadow-2xs cursor-pointer min-h-[38px]"
          title="Refresh Operations Data"
        >
         <RefreshCw className={`h-4 w-4 text-foreground/80 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden min-[400px]:inline">Refresh</span>
        </button>

        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center justify-center rounded-full border border-border bg-card p-1 shadow-2xs hover:bg-primary/5 transition-all"
            aria-label="User Account Menu"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#171512] text-white font-bold text-xs sm:text-sm shadow-xs shrink-0">
              {user?.name ? user.name.charAt(0) : "A"}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border bg-card p-3 shadow-xl z-50 space-y-1">
              <div className="flex items-center gap-3 px-2 py-2 border-b border-border/80 pb-3 mb-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAEEF6] dark:bg-[#202736] shrink-0">
                  <UserIcon className="h-5 w-5 text-[#2A3447] dark:text-[#94A3B8]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-muted-foreground font-normal truncate mt-0.5">{user?.email || "admin@instantmechanic.com"}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/dashboard/settings");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/5 transition-colors text-left"
              >
                <UserIcon className="h-4.5 w-4.5 text-foreground/70" />
                Profile Settings
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="h-4.5 w-4.5 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
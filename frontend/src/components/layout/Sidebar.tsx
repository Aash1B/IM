"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Users,
  MapPin,
  Settings,
  LogOut,
  X,
  Activity,
  MapPin as PinIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && resolvedTheme === "dark" ? "/op-white-text.png" : "/op-transparent.png";

  const mainNav = [
    { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { name: "Analytics", href: "/dashboard/analytics", icon: Activity },
    { name: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
    { name: "Services", href: "/dashboard/services", icon: Wrench },
    { name: "Mechanics", href: "/dashboard/mechanics", icon: Users },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Live Map", href: "/dashboard/map", icon: MapPin },
    { name: "Activity Feed", href: "/dashboard/activity", icon: Activity },
    { name: "Profile", href: "/dashboard/settings", icon: Settings },
  ];

  const renderSidebarContent = (isMobile: boolean) => {
    const isCollapsed = isMobile ? false : collapsed;
    return (
      <div className="flex h-full flex-col justify-between bg-[#24201C] text-white border-r border-border">
        {/* Brand Header */}
        <div className="relative flex h-16 sm:h-18 md:h-20 w-full border-b border-border bg-card overflow-hidden shrink-0">
          {isCollapsed ? (
            /* Collapsed Header Layout: Centered logo image */
            <div className="relative flex h-full w-full flex-col items-center justify-center p-2">
              <Link
                href="/dashboard/overview"
                className="flex h-full w-full items-center justify-center"
              >
                <img
                  src={logoSrc}
                  alt="Instant Mechanic"
                  className="h-full w-full object-contain"
                />
              </Link>
            </div>
          ) : (
            /* Expanded Header Layout: Left-aligned logo image */
            <div className="relative flex h-full w-full items-center justify-start pl-4 pr-6 py-3 overflow-hidden">
              <Link href="/dashboard/overview" className="flex h-full w-full items-center justify-start">
                <img
                  src={logoSrc}
                  alt="Instant Mechanic"
                  className="h-full max-w-full object-contain object-left"
                />
              </Link>

              {/* Mobile close button */}
              <button
                onClick={onCloseMobile}
                className="absolute right-3 top-3 md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs z-10"
                aria-label="Close Navigation Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {/* NAVIGATION */}
          <div className={cn("py-2 space-y-1", isCollapsed ? "px-2" : "px-3 lg:px-4")}>
            {mainNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center rounded-2xl transition-all group relative min-h-[44px]",
                    isCollapsed
                      ? "h-11 w-11 justify-center mx-auto"
                      : "gap-3 px-3 lg:px-4 py-2 md:py-2.5 text-sm lg:text-base font-medium",
                    isActive
                      ? "bg-[#F98513] text-white font-semibold shadow-md"
                      : "text-gray-300 hover:bg-[#342E28] hover:text-white font-medium"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {!isCollapsed && <span className={cn(isMobile ? "inline" : "hidden lg:inline")}>{item.name}</span>}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 hidden rounded-xl bg-[#24201C] px-3.5 py-2 text-sm font-medium text-white group-hover:block z-50 whitespace-nowrap shadow-xl border border-[#403830]">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Sign Out Footer Action Card */}
        <div className={cn("bg-[#24201C] text-white", isCollapsed ? "p-2" : "p-3 lg:p-4")}>
          <button
            onClick={logout}
            className={cn(
              "flex items-center rounded-2xl text-rose-500 hover:bg-rose-950/30 hover:text-rose-400 transition-all font-bold min-h-[44px]",
              isCollapsed
                ? "h-11 w-11 justify-center mx-auto"
                : "w-full justify-start px-3 lg:px-4 py-2 md:py-2.5 text-sm lg:text-base"
            )}
            title="Sign Out"
          >
            <span className={cn(isMobile ? "inline" : "hidden lg:inline")}>Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 shadow-xl",
          collapsed ? "w-22" : "w-22 lg:w-[380px]"
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[320px] max-w-[85vw] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};
"use client";

import React, { useEffect, useState } from "react";
import { Wrench, Search, DollarSign, Tag, Calendar, Activity, ArrowUpRight, CheckCircle2, Info } from "lucide-react";
import { serviceService } from "@/services/service.service";
import { ServiceItem } from "@/types/service";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const res = await serviceService.getServices();
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBookingsAll = services.reduce((acc, s) => acc + (s.bookingsCount || 0), 0);
  const totalRevenueAll = services.reduce((acc, s) => acc + (s.totalRevenue || 0), 0);
  const avgPrice = services.length ? services.reduce((acc, s) => acc + s.price, 0) / services.length : 0;

  return (
    <div className="space-y-4 sm:space-y-6 pt-2">

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-card border border-border bg-brand-grid dark:bg-dark-grid rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Services</span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
              <Tag className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">{services.length}</p>
          <span className="text-xs sm:text-sm text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
            <CheckCircle2 className="w-4 h-4" /> Fully Operational
          </span>
        </div>

        <div className="bg-card border border-border bg-brand-grid dark:bg-dark-grid rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Average Price</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">${avgPrice.toFixed(2)}</p>
          <span className="text-xs sm:text-sm text-muted-foreground font-medium mt-1.5 block">Per service call</span>
        </div>

        <div className="bg-card border border-border bg-brand-grid dark:bg-dark-grid rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Bookings</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">{totalBookingsAll}</p>
          <span className="text-xs sm:text-sm text-blue-600 font-medium mt-1.5 block">Across all categories</span>
        </div>

        <div className="bg-card border border-border bg-brand-grid dark:bg-dark-grid rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cumulative Revenue</span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">${totalRevenueAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span className="text-xs sm:text-sm text-purple-600 font-medium mt-1.5 block">Generated from service orders</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-2xs">
        <div className="relative flex-1 max-w-full sm:max-w-lg">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-base sm:text-lg font-bold text-gray-700">No services match your search query</p>
          <p className="text-sm text-gray-400 mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3.5">
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-extrabold text-sm sm:text-base rounded-xl">
                    ${service.price.toFixed(2)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                    ID: {service.id}
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-2 leading-snug">{service.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-normal">
                  {service.description || "Standard vehicle maintenance & repair procedure."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block font-semibold">Completed Orders</span>
                  <span className="text-sm sm:text-base font-bold text-gray-800">{service.bookingsCount || 0} bookings</span>
                </div>
                <button
                  onClick={() => setSelectedService(service)}
                  className="px-4 py-2 bg-gray-900 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Details <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Service Breakdown</span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-base font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="text-xs sm:text-sm text-indigo-800 font-bold block mb-1.5">Service Description</span>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {selectedService.description || "Standard vehicle service routine."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <span className="text-xs text-gray-500 font-semibold block mb-1">Standard Rate</span>
                  <span className="text-lg sm:text-xl font-black text-gray-900">${selectedService.price.toFixed(2)}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl">
                  <span className="text-xs text-gray-500 font-semibold block mb-1">Total Bookings</span>
                  <span className="text-lg sm:text-xl font-black text-gray-900">{selectedService.bookingsCount || 0}</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <span className="text-xs sm:text-sm font-bold text-emerald-800">Total Revenue Generated</span>
                <span className="text-lg sm:text-xl font-black text-emerald-900">
                  ${(selectedService.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedService(null)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

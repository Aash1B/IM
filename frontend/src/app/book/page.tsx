"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Car,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { bookingService } from "@/services/booking.service";
import { serviceService } from "@/services/service.service";
import { ServiceItem } from "@/types/service";

const POPULAR_MAKES = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Honda",
  "Toyota",
  "Kia",
  "Volkswagen",
];

export default function PublicBookingPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [vehicleMake, setVehicleMake] = useState("Maruti Suzuki");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [vehiclePlate, setVehiclePlate] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  useEffect(() => {
    serviceService
      .getServices()
      .then((res) => {
        const list = res.data || [];
        setServices(list);
        if (list.length > 0) {
          setSelectedServiceId(list[0].id);
        }
      })
      .catch(() => {
        // Fallback realistic services if backend is connecting
        const fallbackServices: ServiceItem[] = [
          {
            id: "serv-1",
            name: "Full Synthetic Oil & Filter Change",
            description: "High grade synthetic engine oil, OES filter, and 15-point safety inspection.",
            price: 1499,
          },
          {
            id: "serv-2",
            name: "Brake Pad Replacement & Rotor Service",
            description: "Front/rear ceramic brake pads installation and rotor resurfacing.",
            price: 2299,
          },
          {
            id: "serv-3",
            name: "Complete AC Servicing & Gas Refill",
            description: "R134a refrigerant top-up, evaporator & condenser deep cleaning.",
            price: 1850,
          },
          {
            id: "serv-4",
            name: "Computerized Engine Diagnostic",
            description: "OBD-II scanner diagnostic, sensor readout, and ECU fault code clearance.",
            price: 799,
          },
        ];
        setServices(fallbackServices);
        setSelectedServiceId(fallbackServices[0].id);
      })
      .finally(() => setLoadingServices(false));
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!selectedServiceId) {
        throw new Error("Please select a service");
      }
      if (!customerName.trim()) {
        throw new Error("Please enter your name");
      }
      if (!customerEmail.trim() || !customerEmail.includes("@")) {
        throw new Error("Please provide a valid email address");
      }
      if (!customerPhone.trim()) {
        throw new Error("Please provide a contact phone number");
      }
      if (!vehicleMake.trim() || !vehicleModel.trim()) {
        throw new Error("Please provide your vehicle make and model");
      }

      const res = await bookingService.createBooking({
        serviceId: selectedServiceId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleYear: Number(vehicleYear),
        vehicleLicensePlate: vehiclePlate.trim().toUpperCase() || undefined,
        bookingDate: new Date(bookingDate).toISOString(),
        amount: selectedService ? selectedService.price : 1499,
      });

      setConfirmedBooking(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#F98513] selection:text-white">
      {/* Top Brand Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard/overview" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F98513] text-white shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                INSTANT<span className="text-[#F98513]">MECHANIC</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-[#F98513]/10 text-[#F98513] font-semibold">
                Online Service Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-muted transition-colors"
            >
              Operations Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {confirmedBooking ? (
          /* Success Screen */
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                Appointment Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                Your Mechanic is Booked!
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                We have received your appointment request and sent a confirmation email to{" "}
                <strong className="text-foreground">{confirmedBooking.customer.email}</strong>.
              </p>
            </div>

            {/* Booking Summary Ticket */}
            <div className="rounded-2xl border border-border bg-secondary/50 p-6 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-xs font-semibold text-muted-foreground">Booking ID</span>
                <span className="text-sm font-mono font-bold text-[#F98513]">
                  {confirmedBooking.bookingNumber || `#BK-${confirmedBooking.id.substring(0, 8).toUpperCase()}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-semibold text-foreground">{confirmedBooking.service.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-semibold text-foreground">
                  {confirmedBooking.vehicle.make} {confirmedBooking.vehicle.model} ({confirmedBooking.vehicle.registrationNumber || "Standard"})
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Scheduled Date:</span>
                <span className="font-semibold text-foreground">
                  {new Date(confirmedBooking.scheduledAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                <span className="font-bold text-foreground">Estimated Total:</span>
                <span className="text-base font-extrabold text-emerald-500">
                  ₹{confirmedBooking.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setVehicleModel("");
                  setCustomerName("");
                  setCustomerPhone("");
                }}
                className="px-6 py-3 rounded-xl border border-border bg-secondary hover:bg-muted font-bold text-sm transition-colors cursor-pointer"
              >
                Book Another Service
              </button>
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F98513] hover:bg-[#e0750e] font-bold text-sm text-white shadow-lg transition-all"
              >
                <span>View in Operations Hub</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Hero + Form */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F98513]/10 border border-[#F98513]/20 text-[#F98513] text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="h-3.5 w-3.5" /> Doorstep & Workshop Car Services
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  Book Certified Automotive Care
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-2">
                  Choose your required automotive package, tell us about your vehicle, and our certified mechanics will take care of the rest.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Service Selection */}
                <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-[#F98513]" /> 1. Select Maintenance or Repair Service
                  </h2>

                  {loadingServices ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-secondary rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {services.map((serv) => {
                        const isSelected = selectedServiceId === serv.id;
                        return (
                          <div
                            key={serv.id}
                            onClick={() => setSelectedServiceId(serv.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              isSelected
                                ? "border-[#F98513] bg-[#F98513]/5 ring-1 ring-[#F98513]"
                                : "border-border bg-secondary/40 hover:bg-secondary"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                {serv.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {serv.description || "Comprehensive automotive service inspection"}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-base sm:text-lg font-black text-[#F98513]">
                                ₹{serv.price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Vehicle Details */}
                <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Car className="h-4 w-4 text-[#F98513]" /> 2. Vehicle Specifications
                  </h2>

                  {/* Make Chips */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">Vehicle Brand</label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_MAKES.map((make) => (
                        <button
                          key={make}
                          type="button"
                          onClick={() => setVehicleMake(make)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            vehicleMake === make
                              ? "bg-[#F98513] text-white shadow-xs"
                              : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                          }`}
                        >
                          {make}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Model *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Swift / Creta"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Year</label>
                      <input
                        type="number"
                        min="2000"
                        max="2030"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">License Plate</label>
                      <input
                        type="text"
                        placeholder="DL-01-AB-1234"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm uppercase text-foreground focus:border-[#F98513] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Schedule & Contact */}
                <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#F98513]" /> 3. Preferred Slot & Contact Info
                  </h2>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Preferred Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button on mobile */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-[#F98513] text-white font-extrabold text-base shadow-xl hover:bg-[#e0750e] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 lg:hidden disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Scheduling Service...
                    </>
                  ) : (
                    <>
                      <span>Confirm Appointment (₹{selectedService?.price.toLocaleString("en-IN") || 0})</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Col: Live Order Summary & Value Props */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
                <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
                  Appointment Summary
                </h3>

                {selectedService ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-foreground">{selectedService.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Doorstep inspection included</p>
                      </div>
                      <span className="font-black text-foreground">₹{selectedService.price.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="rounded-2xl bg-secondary/50 p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Vehicle:</span>
                        <span className="font-medium text-foreground">
                          {vehicleMake} {vehicleModel || "(Model not set)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Appointment Time:</span>
                        <span className="font-medium text-foreground">
                          {new Date(bookingDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Standard Warranty:</span>
                        <span className="font-medium text-emerald-500">6 Months / 10,000 KM</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Payable Amount</p>
                        <p className="text-xs text-emerald-500 font-semibold">Pay after service completion</p>
                      </div>
                      <span className="text-2xl font-black text-[#F98513]">
                        ₹{selectedService.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full hidden lg:flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#F98513] text-white font-extrabold text-base shadow-xl hover:bg-[#e0750e] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Scheduling Service...
                        </>
                      ) : (
                        <>
                          <span>Confirm & Book Appointment</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a service to view pricing details.</p>
                )}
              </div>

              {/* Trust badges */}
              <div className="bg-card/50 border border-border/80 rounded-3xl p-5 space-y-3 text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-[#F98513] shrink-0" />
                  <span>100% Genuine OEM/OES Spare Parts with Warranty</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5 text-[#F98513] shrink-0" />
                  <span>Doorstep Pickup & Real-Time Tracking Updates</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-[#F98513] shrink-0" />
                  <span>Transparent Fixed Pricing — No Hidden Extra Fees</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

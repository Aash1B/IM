"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Wrench, User, Car, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { serviceService } from "@/services/service.service";
import { customerService } from "@/services/customer.service";
import { mechanicService } from "@/services/mechanic.service";
import { ServiceItem } from "@/types/service";
import { Customer } from "@/types/customer";
import { Mechanic } from "@/types/mechanic";
import { BookingStatus } from "@/types/booking";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
}) => {
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  
  // Available selection datasets
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [customVehicleMode, setCustomVehicleMode] = useState(false);

  // New Customer Fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Vehicle Fields
  const [vehicleMake, setVehicleMake] = useState("Maruti Suzuki");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState("");

  // Booking details
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedMechanicId, setSelectedMechanicId] = useState("");
  const [bookingDate, setBookingDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<BookingStatus>("PENDING");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load initial dropdown data on open
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setDataLoading(true);
    setError(null);
    setSuccessMessage(null);

    Promise.all([
      serviceService.getServices().catch(() => ({ data: [] })),
      customerService.getCustomers({ limit: 50 }).catch(() => ({ data: [] })),
      mechanicService.getMechanics({ limit: 50 }).catch(() => ({ data: [] })),
    ]).then(([srvRes, custRes, mechRes]) => {
      if (!mounted) return;
      setServices(srvRes.data || []);
      setCustomers(custRes.data || []);
      setMechanics(mechRes.data || []);

      if (srvRes.data?.length > 0) {
        setSelectedServiceId(srvRes.data[0].id);
        setAmount(srvRes.data[0].price);
      }
      setDataLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // When service changes, update suggested amount
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const chosen = services.find((s) => s.id === serviceId);
    if (chosen) {
      setAmount(chosen.price);
    }
  };

  // When mechanic is picked, auto switch to ASSIGNED if still PENDING
  const handleMechanicChange = (mechId: string) => {
    setSelectedMechanicId(mechId);
    if (mechId && status === "PENDING") {
      setStatus("ASSIGNED");
    } else if (!mechId && status === "ASSIGNED") {
      setStatus("PENDING");
    }
  };

  // Selected customer vehicles
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerVehicles = currentCustomer?.vehicles || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!selectedServiceId) {
        throw new Error("Please select an automotive service");
      }

      const payload: any = {
        serviceId: selectedServiceId,
        bookingDate: new Date(bookingDate).toISOString(),
        amount: Number(amount),
        status,
        ...(selectedMechanicId ? { mechanicId: selectedMechanicId } : {}),
      };

      if (customerMode === "existing") {
        if (!selectedCustomerId) {
          throw new Error("Please select an existing customer");
        }
        payload.customerId = selectedCustomerId;

        if (!customVehicleMode && selectedVehicleId) {
          payload.vehicleId = selectedVehicleId;
        } else {
          if (!vehicleMake || !vehicleModel) {
            throw new Error("Please provide vehicle make and model");
          }
          payload.vehicleMake = vehicleMake;
          payload.vehicleModel = vehicleModel;
          payload.vehicleYear = Number(vehicleYear);
          payload.vehicleLicensePlate = vehicleLicensePlate || undefined;
        }
      } else {
        if (!customerName.trim()) {
          throw new Error("Please enter customer name");
        }
        if (!customerEmail.trim() || !customerEmail.includes("@")) {
          throw new Error("Please enter a valid customer email address");
        }
        payload.customerName = customerName.trim();
        payload.customerEmail = customerEmail.trim().toLowerCase();
        payload.customerPhone = customerPhone.trim() || undefined;

        if (!vehicleMake || !vehicleModel) {
          throw new Error("Please provide vehicle make and model");
        }
        payload.vehicleMake = vehicleMake;
        payload.vehicleModel = vehicleModel;
        payload.vehicleYear = Number(vehicleYear);
        payload.vehicleLicensePlate = vehicleLicensePlate || undefined;
      }

      const res = await bookingService.createBooking(payload);
      setSuccessMessage(`Booking #${res.data.bookingNumber || res.data.id.substring(0, 8).toUpperCase()} created successfully!`);
      setTimeout(() => {
        onBookingCreated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3.5 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-border text-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F98513]/10 text-[#F98513] border border-[#F98513]/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Create New Booking</h2>
              <p className="text-xs text-muted-foreground">Register an appointment for a customer vehicle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Profile Mode */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-[#F98513]" /> 1. Customer Information
              </label>
              <div className="flex items-center rounded-xl bg-secondary p-1 border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCustomerMode("new")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    customerMode === "new"
                      ? "bg-[#F98513] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  + New Customer
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("existing")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    customerMode === "existing"
                      ? "bg-[#F98513] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Existing Customer
                </button>
              </div>
            </div>

            {customerMode === "existing" ? (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Select Existing Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setSelectedVehicleId("");
                  }}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                  required
                >
                  <option value="">-- Choose registered customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email || c.phone || "No contact"}) - {c.vehicles?.length || 0} vehicle(s)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder-gray-400 focus:border-[#F98513] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder-gray-400 focus:border-[#F98513] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder-gray-400 focus:border-[#F98513] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Vehicle Specs */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Car className="h-4 w-4 text-[#F98513]" /> 2. Vehicle Specification
              </label>
              {customerMode === "existing" && customerVehicles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomVehicleMode(!customVehicleMode)}
                  className="text-xs text-[#F98513] hover:underline font-medium"
                >
                  {customVehicleMode ? "Use saved vehicle" : "+ Add another vehicle"}
                </button>
              )}
            </div>

            {customerMode === "existing" && customerVehicles.length > 0 && !customVehicleMode ? (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Select Customer Vehicle
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                  required
                >
                  <option value="">-- Choose saved vehicle --</option>
                  {customerVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registrationNumber || "No plate"})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="Maruti Suzuki"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder-gray-400 focus:border-[#F98513] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="Swift / Creta"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder-gray-400 focus:border-[#F98513] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Year</label>
                  <input
                    type="number"
                    min="1995"
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
                    value={vehicleLicensePlate}
                    onChange={(e) => setVehicleLicensePlate(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground uppercase placeholder-gray-400 focus:border-[#F98513] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Service Selection & Pricing */}
          <div className="space-y-4 pt-2 border-t border-border">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#F98513]" /> 3. Service Package & Pricing
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1.5">Select Service *</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                  required
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₹{s.price.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-[#F98513] focus:border-[#F98513] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Schedule & Assignment */}
          <div className="space-y-4 pt-2 border-t border-border">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F98513]" /> 4. Appointment & Mechanic Assignment
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Assign Mechanic (Optional)</label>
                <select
                  value={selectedMechanicId}
                  onChange={(e) => handleMechanicChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
                >
                  <option value="">-- Unassigned (Pending) --</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone || "Mechanic"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Booking Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground focus:border-[#F98513] focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="MECHANIC_ON_THE_WAY">MECHANIC_ON_THE_WAY</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-border bg-secondary text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || dataLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F98513] text-sm font-bold text-white shadow-lg hover:bg-[#e0750e] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm & Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
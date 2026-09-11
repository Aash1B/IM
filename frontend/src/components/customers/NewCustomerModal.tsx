"use client";

import React, { useState } from "react";
import { X, User, Mail, Phone, Car, Loader2, CheckCircle2 } from "lucide-react";
import { customerService } from "@/services/customer.service";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Optional initial vehicle
  const [addVehicle, setAddVehicle] = useState(false);
  const [vehicleMake, setVehicleMake] = useState("Maruti Suzuki");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error("Please enter customer name");
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      await customerService.createCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        ...(addVehicle && vehicleMake && vehicleModel
          ? {
              vehicleMake: vehicleMake.trim(),
              vehicleModel: vehicleModel.trim(),
              vehicleYear: Number(vehicleYear),
              vehicleLicensePlate: vehicleLicensePlate.trim().toUpperCase() || undefined,
            }
          : {}),
      });

      setSuccessMessage(`Customer ${name.trim()} added successfully!`);

      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setVehicleModel("");
        setVehicleLicensePlate("");
        setAddVehicle(false);
        setSuccessMessage(null);
        onCustomerCreated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to add customer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border text-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF5A00]/10 text-[#FF5A00] border border-[#FF5A00]/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Add New Customer</h2>
              <p className="text-xs text-muted-foreground">Register customer and link their vehicle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Customer Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Pooja Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-[#FF5A00] focus:outline-none"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="pooja.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-[#FF5A00] focus:outline-none"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-[#FF5A00] focus:outline-none"
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Optional Vehicle Section */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-[#FF5A00]" /> Add Initial Vehicle (Optional)
              </label>
              <button
                type="button"
                onClick={() => setAddVehicle(!addVehicle)}
                className="text-xs font-bold text-[#FF5A00] hover:underline cursor-pointer"
              >
                {addVehicle ? "Remove Vehicle" : "+ Add Vehicle Details"}
              </button>
            </div>

            {addVehicle && (
              <div className="space-y-3 bg-secondary/60 p-3.5 rounded-2xl border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Make</label>
                    <input
                      type="text"
                      placeholder="Maruti Suzuki / Hyundai"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-[#FF5A00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="Creta / Swift"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-[#FF5A00] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Year</label>
                    <input
                      type="number"
                      min="1995"
                      max="2030"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-[#FF5A00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">License Plate</label>
                    <input
                      type="text"
                      placeholder="DL-01-AB-1234"
                      value={vehicleLicensePlate}
                      onChange={(e) => setVehicleLicensePlate(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs uppercase text-foreground focus:border-[#FF5A00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#FF5A00] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#e04f00] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

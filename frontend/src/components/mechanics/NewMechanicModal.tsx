"use client";

import React, { useState } from "react";
import { X, Wrench, User, Mail, Phone, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { mechanicService } from "@/services/mechanic.service";

interface NewMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMechanicCreated: () => void;
}

export const NewMechanicModal: React.FC<NewMechanicModalProps> = ({
  isOpen,
  onClose,
  onMechanicCreated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("28.5355");
  const [longitude, setLongitude] = useState("77.3910");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error("Please enter mechanic name");
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      await mechanicService.createMechanic({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });

      setSuccessMessage(`Mechanic ${name.trim()} added successfully!`);

      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setSuccessMessage(null);
        onMechanicCreated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to add mechanic");
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F98513]/10 text-[#F98513] border border-[#F98513]/20">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Add New Mechanic</h2>
              <p className="text-xs text-muted-foreground">Register a certified mechanic to the fleet</p>
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
              Mechanic Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Vikram Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
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
                placeholder="vikram.singh@instantmechanic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
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
                className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-[#F98513] focus:outline-none"
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#F98513]" /> Base Location Coordinates (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Latitude</label>
                <input
                  type="text"
                  placeholder="28.5355"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-mono text-foreground focus:border-[#F98513] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Longitude</label>
                <input
                  type="text"
                  placeholder="77.3910"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-mono text-foreground focus:border-[#F98513] focus:outline-none"
                />
              </div>
            </div>
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
              className="flex items-center gap-2 rounded-xl bg-[#F98513] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#e0750e] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Mechanic"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

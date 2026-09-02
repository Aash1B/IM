import { Pagination } from "./booking";

export type { Pagination };

export type MechanicStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "ON_THE_WAY"
  | "BUSY"
  | "OFFLINE";

export interface MechanicLocation {
  latitude: number;
  longitude: number;
  updatedAt?: string;
}

export interface CurrentBookingSummary {
  id: string;
  bookingNumber: string;
  customerName?: string;
  status?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: MechanicStatus;
  jobsCompleted: number;
  totalJobs?: number;
  currentBooking?: CurrentBookingSummary | null;
  lastBooking?: CurrentBookingSummary | null;
  location?: MechanicLocation;
  recentBookings?: any[];
}

export interface MechanicFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: MechanicStatus | "";
}

export interface MechanicsResponse {
  data: Mechanic[];
  pagination: Pagination;
}

export interface SingleMechanicResponse {
  data: Mechanic;
}

export interface MechanicLocationItem {
  id: string;
  name: string;
  status: MechanicStatus;
  latitude: number;
  longitude: number;
  currentBooking?: {
    id: string;
    bookingNumber: string;
  } | null;
  updatedAt: string;
}

export interface MechanicLocationsResponse {
  data: MechanicLocationItem[];
}

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "MECHANIC_ON_THE_WAY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface BookingCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface BookingVehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: number;
}

export interface BookingService {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface BookingMechanic {
  id: string;
  name: string;
  phone?: string;
  status?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customer: BookingCustomer;
  vehicle: BookingVehicle;
  service: BookingService;
  mechanic?: BookingMechanic | null;
  status: BookingStatus;
  amount: number;
  scheduledAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus | "";
  mechanicId?: string;
  serviceId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookingsResponse {
  data: Booking[];
  pagination: Pagination;
}

export interface SingleBookingResponse {
  data: Booking;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

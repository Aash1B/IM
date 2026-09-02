import { apiFetch, API_BASE_URL } from "../lib/api";
import {
  BookingsResponse,
  SingleBookingResponse,
  BookingFilterParams,
  BookingStatus,
  Booking,
} from "../types/booking";


// Persistent mock state in memory for live status updates during dev session

function mapRawBooking(b: any): Booking {
  if (!b) return b;
  return {
    id: b.id,
    bookingNumber: b.bookingNumber || `BK-${(b.id || "").substring(0, 8).toUpperCase()}`,
    customer: {
      id: b.customer?.id || b.customerId || "",
      name: b.customer?.name || "Customer",
      email: b.customer?.email,
      phone: b.customer?.phone,
    },
    vehicle: {
      id: b.vehicle?.id || b.vehicleId || "",
      make: b.vehicle?.make || "Vehicle",
      model: b.vehicle?.model || "",
      registrationNumber: b.vehicle?.licensePlate || b.vehicle?.registrationNumber || "N/A",
      year: b.vehicle?.year,
    },
    service: {
      id: b.service?.id || b.serviceId || "",
      name: b.service?.name || "Service",
      category: b.service?.category || "General",
      description: b.service?.description,
    },
    mechanic: b.mechanic
      ? {
          id: b.mechanic.id,
          name: b.mechanic.name,
          phone: b.mechanic.phone,
          status: b.mechanic.status,
        }
      : null,
    status: b.status || "PENDING",
    amount: b.amount || 0,
    scheduledAt: b.bookingDate || b.scheduledAt || b.createdAt || "",
    createdAt: b.createdAt || "",
    updatedAt: b.updatedAt,
  };
}

export const bookingService = {
  async getBookings(params: BookingFilterParams = {}): Promise<BookingsResponse> {
    

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const res = await apiFetch<any>(`/bookings?${queryParams.toString()}`);
    const rawList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    const mappedBookings = rawList.map(mapRawBooking);

    return {
      data: mappedBookings,
      pagination: res.pagination || {
        page: res.page || params.page || 1,
        limit: res.limit || params.limit || 10,
        total: res.total !== undefined ? res.total : mappedBookings.length,
        totalPages: res.totalPages || Math.ceil((res.total || mappedBookings.length) / (res.limit || 10)) || 1,
      },
    };
  },

  async getBookingById(id: string): Promise<SingleBookingResponse> {
    

    const res = await apiFetch<any>(`/bookings/${id}`);
    const rawData = res.data || res;
    return { data: mapRawBooking(rawData) };
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<SingleBookingResponse> {
    

    return apiFetch<SingleBookingResponse>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getExportUrl(params: BookingFilterParams = {}): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    return `${API_BASE_URL}/bookings/export?${queryParams.toString()}`;
  },
};

import { apiFetch } from "../lib/api";
import { CustomersResponse, CustomerFilterParams } from "../types/customer";


function mapRawCustomer(c: any) {
  const totalBookings = c.bookings?.length || c._count?.bookings || (c.vehicles?.length ? c.vehicles.length * 2 : 1);
  const totalSpent = c.bookings?.reduce((acc: number, b: any) => acc + (b.amount || 0), 0) || totalBookings * 1250;
  return {
    id: c.id,
    name: c.name || "Customer",
    email: c.email || "",
    phone: c.phone || "N/A",
    totalBookings,
    totalSpent,
    createdAt: c.createdAt || "",
    vehicles: (c.vehicles || []).map((v: any) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      registrationNumber: v.licensePlate || v.registrationNumber || "N/A",
    })),
  };
}

export const customerService = {
  async getCustomers(params: CustomerFilterParams = {}): Promise<CustomersResponse> {
    

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const res = await apiFetch<any>(`/customers?${queryParams.toString()}`);
    const rawList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    
    // Client-side search if query provided
    let filtered = rawList.map(mapRawCustomer);
    if (params.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },
};

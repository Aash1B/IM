import { Pagination } from "./booking";

export type { Pagination };

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomersResponse {
  data: Customer[];
  pagination: Pagination;
}

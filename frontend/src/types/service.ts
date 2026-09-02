export interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  bookingsCount?: number;
  totalRevenue?: number;
}

export interface ServicesResponse {
  data: ServiceItem[];
}

export interface SingleServiceResponse {
  data: ServiceItem;
}

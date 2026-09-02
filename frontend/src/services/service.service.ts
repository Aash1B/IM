import { apiFetch } from "../lib/api";
import { ServicesResponse, SingleServiceResponse, ServiceItem } from "../types/service";


export const serviceService = {
  async getServices(): Promise<ServicesResponse> {
    

    const data = await apiFetch<ServiceItem[]>("/services");
    return { data: Array.isArray(data) ? data : (data as any).data || [] };
  },

  async getServiceById(id: string): Promise<SingleServiceResponse> {
    

    const data = await apiFetch<ServiceItem>(`/services/${id}`);
    return { data: data.id ? data : (data as any).data };
  },
};

import { apiFetch } from "../lib/api";
import { NotificationsResponse, Notification } from "../types/notification";



export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    
    const res = await apiFetch<any>("/notifications");
    const rawList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return { data: rawList };
  },

  async markAsRead(id: string): Promise<NotificationsResponse> {
    
    const res = await apiFetch<any>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
    const rawList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return { data: rawList };
  },
};

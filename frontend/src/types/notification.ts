export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_ASSIGNED"
  | "BOOKING_COMPLETED"
  | "BOOKING_CANCELLED"
  | "MECHANIC_STATUS_CHANGED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
}

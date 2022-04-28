import { Timestamp } from "firebase-admin/firestore";

export interface FireNotificationAction {
  name: string,
  action: string,
}

export interface FireNotification {
  title: string,
  description: string,
  createdAt: Timestamp,
  actions?: FireNotificationAction[]
}

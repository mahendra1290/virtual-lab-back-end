import { Timestamp } from "firebase-admin/firestore";

interface FireNotificationAction {
  name: string,
  action: string,
}

interface FireNotification {
  title: string,
  description: string,
  createdAt: Timestamp,
  actions?: FireNotificationAction[]
}

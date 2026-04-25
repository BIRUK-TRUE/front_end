import { Metadata } from "next";
import { GuardianNotificationList } from "@/features/guardian-portal/components/GuardianNotificationList";

export const metadata: Metadata = {
  title: "Notifications | Guardian Portal",
  description: "View alerts and messages about your children.",
};

export default function NotificationsPage() {
  return <GuardianNotificationList />;
}

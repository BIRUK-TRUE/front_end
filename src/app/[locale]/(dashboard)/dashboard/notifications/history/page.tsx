"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { NotificationHistory } from "@/features/notifications/components/NotificationHistory";
import { NotificationHistoryDetail } from "@/features/notifications/components/NotificationHistoryDetail";
import { PageHeader } from "@/components/shared/page-header";

export default function NotificationHistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const t = useTranslations("notifications.history");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <NotificationHistory onViewDetails={setSelectedId} />

      <NotificationHistoryDetail
        notificationId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

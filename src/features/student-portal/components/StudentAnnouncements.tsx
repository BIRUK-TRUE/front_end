"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Announcement } from "../types";

export function StudentAnnouncements({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const t = useTranslations("studentPortal.dashboard");

  if (!announcements || announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("announcements")}</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          {t("noAnnouncements")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("announcements")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((item) => (
          <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
             <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.datePosted).toLocaleDateString()}
                </p>
             </div>
             <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {item.excerpt}
             </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

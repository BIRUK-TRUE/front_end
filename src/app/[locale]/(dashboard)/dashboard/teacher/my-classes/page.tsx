"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTeacherClasses, useClassRoster } from "@/features/teacher/hooks/useTeacherClasses";
import { TeacherClassCard } from "@/features/teacher/components/TeacherClassCard";
import { TeacherClassRoster } from "@/features/teacher/components/TeacherClassRoster";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function RosterPanel({ sectionId, onBack }: { sectionId: string; onBack: () => void }) {
  const tc = useTranslations("common");
  const roster = useClassRoster(sectionId);

  if (roster.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (roster.isError || !roster.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{tc("errorOccurred")}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => roster.refetch()}>
            {tc("reset")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {tc("back")}
      </Button>
      <TeacherClassRoster data={roster.data} />
    </div>
  );
}

export default function MyClassesPage() {
  const t = useTranslations("teacher.myClasses");
  const tc = useTranslations("common");
  const { user } = useAuthStore();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const classes = useTeacherClasses(user?.id ?? "");

  if (!user) return null;

  if (selectedSection) {
    return (
      <div className="space-y-4">
        <RosterPanel sectionId={selectedSection} onBack={() => setSelectedSection(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {classes.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {classes.isError && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{tc("errorOccurred")}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => classes.refetch()}>
              {tc("reset")}
            </Button>
          </CardContent>
        </Card>
      )}

      {classes.data && classes.data.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">{t("noClasses")}</p>
          </CardContent>
        </Card>
      )}

      {classes.data && classes.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.data.map((item) => (
            <div
              key={item.sectionId}
              onClick={() => {
                const url = new URL(window.location.href);
                if (url.searchParams.get("sectionId") === item.sectionId) return;
              }}
            >
              <TeacherClassCard
                item={item}
                onViewStudents={() => setSelectedSection(item.sectionId)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Info } from "lucide-react";
import { format } from "date-fns";
import { useGuardianDashboard } from "../hooks/useGuardianDashboard";
import { ChildSummaryCard } from "./ChildSummaryCard";
import { GuardianAlertBanner } from "./GuardianAlertBanner";

interface Props {
  guardianId: string;
}

export function GuardianDashboardHome({ guardianId }: Props) {
  const t = useTranslations("guardianPortal.dashboard");
  const tc = useTranslations("common");
  const { user } = useAuthStore();
  const { data, isLoading, isError } = useGuardianDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">{tc("errorOccurred")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcome", { name: user?.full_name || "Guardian" })}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </div>

      <GuardianAlertBanner children={data.children} />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {t("myChildren")}
          </h2>
          <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-full text-muted-foreground uppercase tracking-wider">
            {data.children.length} {t("myChildren")}
          </span>
        </div>

        {data.children.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground max-w-md mx-auto italic">
                {t("noChildren")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.children.map((child) => (
              <ChildSummaryCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2">
          {/* Notifications / Activity Feed could go here */}
        </section>
        
        <aside className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                {t("recentAlerts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              {data.recent_alerts.length === 0 ? (
                <p className="text-sm text-center py-6 text-muted-foreground italic">
                  {t("noAlerts")}
                </p>
              ) : (
                <div className="divide-y">
                  {data.recent_alerts.map((alert) => (
                    <div key={alert.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {alert.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(alert.created_at), "MMM d")}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-tight mb-1">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground italic">Student: {alert.student_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

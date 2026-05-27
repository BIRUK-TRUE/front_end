"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { useMyChildren } from "@/features/guardian-portal/hooks/useMyChildren";
import { ChildDetailTabs } from "@/features/guardian-portal/components/ChildDetailTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ChildDetails } from "@/features/guardian-portal/types";

export default function ChildDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const t = useTranslations("guardianPortal.childDetail");
  const authReady = useAuthReady();

  const { data: children, isLoading, isError } = useMyChildren();

  const matchedChild = children?.find(
    (child) => String(child.id) === String(studentId),
  );

  const child: ChildDetails | undefined = matchedChild
    ? {
        ...matchedChild,
        guardian_owned: true,
        enrollment_date: "",
        academic_year: "",
      }
    : undefined;

  if (!authReady || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("childRegistryError")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("childRegistryErrorDesc")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/guardian">{t("returnToDashboard")}</Link>
        </Button>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-orange-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("accessDenied")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("accessDeniedDesc")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/guardian">{t("returnToDashboard")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/guardian">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{child.full_name}</h1>
          <p className="text-muted-foreground">{t("detailedView")}</p>
        </div>
      </div>

      <ChildDetailTabs child={child} />
    </div>
  );
}

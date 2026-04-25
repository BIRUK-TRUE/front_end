"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useMyChildren } from "@/features/guardian-portal/hooks/useMyChildren";
import { useChildDetails } from "@/features/guardian-portal/hooks/useChildDetails";
import { ChildDetailTabs } from "@/features/guardian-portal/components/ChildDetailTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function ChildDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const tc = useTranslations("common");
  const t = useTranslations("guardianPortal.childDetail");
  
  // CRITICAL IDOR SECURITY CHECK (Check Group 10.1)
  const { user, isHydrated } = useAuthStore();
  const guardianId = user?.id ?? '';
  
  // 1. Fetch guardian's linked children
  const { data: children, isLoading: isLoadingChildren } = useMyChildren();
  
  // 2. Verify studentId from URL is in guardian's children list
  const isAuthorized = children?.some(child => child.id === studentId);
  
  // 3. Only fetch child data if authorized
  const { data: child, isLoading: isLoadingChild, isError } = useChildDetails(studentId);

  if (!isHydrated || isLoadingChildren) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // 4. If not authorized: show 403 unauthorized message, fetch nothing
  if (!isAuthorized) {
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

  if (isLoadingChild) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !child) {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/guardian">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{child.fullName}</h1>
          <p className="text-muted-foreground">{t("detailedView")}</p>
        </div>
      </div>

      <ChildDetailTabs child={child} />
    </div>
  );
}

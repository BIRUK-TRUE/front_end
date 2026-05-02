"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { GuardianDashboardHome } from "@/features/guardian-portal/components/GuardianDashboardHome";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuardianPageClient() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
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

  if (!user) {
    return null;
  }

  return <GuardianDashboardHome guardianId={user.guardian_id || user.id} />;
}

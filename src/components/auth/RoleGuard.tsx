"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * RoleGuard - Enforces role-based access control at the component level.
 * Use this in layouts to protect entire route segments.
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only check once the store is hydrated
    if (!isHydrated) return;

    // If no user, ProtectedRoute will handle redirect to login
    if (!user) return;

    // Check if user has at least one of the allowed roles
    const hasAccess = allowedRoles.some((role) => user.roles.includes(role));

    if (!hasAccess) {
      router.push("/unauthorized");
    }
  }, [user, isHydrated, allowedRoles, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Hide children while checking access if user is logged in but not allowed
  const hasAccess = user && allowedRoles.some((role) => user.roles.includes(role));

  if (!user || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}

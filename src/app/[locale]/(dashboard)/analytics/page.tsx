import { AnalyticsOverview } from "@/features/analytics/components/AnalyticsOverview";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "director"]}>
      <AnalyticsOverview />
    </RoleGuard>
  );
}

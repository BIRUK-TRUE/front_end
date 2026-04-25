import { TeacherAnalyticsView } from "@/features/analytics/components/TeacherAnalyticsView";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TeacherAnalyticsPage() {
  return (
    <ProtectedRoute requireRoles={["teacher"]}>
      <div className="p-8">
        <TeacherAnalyticsView />
      </div>
    </ProtectedRoute>
  );
}

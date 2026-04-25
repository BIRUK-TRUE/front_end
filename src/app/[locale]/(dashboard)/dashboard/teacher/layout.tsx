import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireRoles={["teacher"]}>
      {children}
    </ProtectedRoute>
  );
}

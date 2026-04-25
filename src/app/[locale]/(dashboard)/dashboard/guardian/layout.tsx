import { ProtectedRoute } from '@/components/auth/protected-route';

export default function GuardianDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireRoles={['guardian']}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </ProtectedRoute>
  );
}

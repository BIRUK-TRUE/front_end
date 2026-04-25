'use client';

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireRoles={['student']}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </ProtectedRoute>
  );
}

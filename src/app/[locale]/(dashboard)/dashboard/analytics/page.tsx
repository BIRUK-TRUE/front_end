'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { AnalyticsOverview } from '@/features/analytics/components/AnalyticsOverview';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requireRoles={['admin', 'director']}>
      <AnalyticsOverview />
    </ProtectedRoute>
  );
}

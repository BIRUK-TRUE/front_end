'use client';

import { ApiDebugPanel } from '@/components/debug/api-debug';
import { PageHeader } from '@/components/shared/page-header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Bug } from 'lucide-react';

function DebugPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="API Debug"
        icon={Bug}
        breadcrumb={['Admin', 'Debug']}
      />
      
      <ApiDebugPanel />
    </div>
  );
}

export default function DebugPageWithAuth() {
  return (
    <ProtectedRoute requireRoles={['admin']}>
      <DebugPage />
    </ProtectedRoute>
  );
}
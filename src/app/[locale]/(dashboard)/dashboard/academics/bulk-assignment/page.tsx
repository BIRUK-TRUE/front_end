'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function BulkAssignmentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/academics/subject-assignment');
  }, [router]);

  return null;
}

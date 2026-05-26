'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const EnrollmentChart = dynamic(
  () =>
    import('./enrollment-chart').then((mod) => ({
      default: mod.EnrollmentChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full rounded-lg" />,
  }
);

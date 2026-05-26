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
    loading: () => <Skeleton className="col-span-full h-[300px] w-full min-w-0 rounded-lg lg:col-span-4" />,
  }
);

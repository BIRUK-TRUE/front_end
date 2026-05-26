'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const chartSkeleton = () => (
  <Skeleton className="h-[300px] w-full rounded-lg" />
);

export const AttendanceTrendChart = dynamic(
  () =>
    import('./AttendanceTrendChart').then((m) => ({
      default: m.AttendanceTrendChart,
    })),
  { ssr: false, loading: chartSkeleton }
);

export const GradeDistributionChart = dynamic(
  () =>
    import('./GradeDistributionChart').then((m) => ({
      default: m.GradeDistributionChart,
    })),
  { ssr: false, loading: chartSkeleton }
);

export const AtRiskSummaryChart = dynamic(
  () =>
    import('./AtRiskSummaryChart').then((m) => ({
      default: m.AtRiskSummaryChart,
    })),
  { ssr: false, loading: chartSkeleton }
);

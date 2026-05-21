'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface StatsRowItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    label: string;
    tone?: 'positive' | 'negative' | 'neutral' | 'warning';
  };
}

const toneClass = {
  positive: 'text-success',
  negative: 'text-destructive',
  neutral: 'text-muted-foreground',
  warning: 'text-warning',
};

export function StatsRow({
  items,
  isLoading,
  className,
}: {
  items: StatsRowItem[];
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)} aria-busy={isLoading}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title} className="shadow-sm">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
                    <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                    {item.trend && (
                      <p className={cn('text-xs font-medium', toneClass[item.trend.tone ?? 'neutral'])}>
                        {item.trend.label}
                      </p>
                    )}
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

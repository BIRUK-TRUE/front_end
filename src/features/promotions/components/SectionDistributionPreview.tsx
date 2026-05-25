'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { SectionDistributionItem } from '../types';

interface SectionDistributionPreviewProps {
  distribution: SectionDistributionItem[];
}

export function SectionDistributionPreview({ distribution }: SectionDistributionPreviewProps) {
  if (distribution.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sections available
      </div>
    );
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 100) {
      return <Badge variant="destructive">Full</Badge>;
    }
    if (percentage >= 90) {
      return <Badge variant="default" className="bg-orange-500">Critical</Badge>;
    }
    if (percentage >= 75) {
      return <Badge variant="default" className="bg-yellow-500">High</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {distribution.map((section) => {
        const totalAssigned = section.current_count + section.proposed_count;
        const utilization = section.capacity > 0
          ? (totalAssigned / section.capacity) * 100
          : 0;

        return (
          <Card key={section.section_id} className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{section.section_name}</h3>
                  <p className="text-sm text-muted-foreground">{section.full_name}</p>
                </div>
                {getUtilizationBadge(utilization)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">
                    {totalAssigned} / {section.capacity}
                  </span>
                </div>
                <Progress
                  value={utilization}
                  className={`h-2 ${getUtilizationColor(utilization)}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{utilization.toFixed(0)}% utilized</span>
                  <span>{section.available_slots - section.proposed_count} slots remaining</span>
                </div>
              </div>

              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium">{section.current_count} students</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Adding:</span>
                  <span className="font-medium text-blue-600">+{section.proposed_count} students</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total After Promotion:</span>
                  <span>{totalAssigned} students</span>
                </div>
              </div>

              {utilization > 95 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-2 text-xs text-red-700 dark:text-red-400">
                  ⚠️ This section is at or near capacity
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

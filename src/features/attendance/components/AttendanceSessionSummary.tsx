'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, UserMinus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceSessionSummaryProps {
  presentCount: number;
  lateCount: number;
  totalStudents: number;
  className?: string;
}

export function AttendanceSessionSummary({ 
  presentCount, 
  lateCount, 
  totalStudents,
  className 
}: AttendanceSessionSummaryProps) {
  const t = useTranslations('attendancePage');
  const notYetMarked = Math.max(0, totalStudents - presentCount - lateCount);

  const stats = [
    {
      label: t('present'),
      value: presentCount,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: t('late'),
      value: lateCount,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: t('notYetMarked'),
      value: notYetMarked,
      icon: UserMinus,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: t('totalStudents'),
      value: totalStudents,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground leading-none mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

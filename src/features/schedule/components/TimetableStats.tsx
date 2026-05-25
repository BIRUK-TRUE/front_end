'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, DoorOpen, AlertCircle } from 'lucide-react';

interface TimetableStatsProps {
  totalPeriods: number;
  totalTeachers: number;
  totalClassrooms: number;
  conflictsCount: number;
}

export function TimetableStats({
  totalPeriods,
  totalTeachers,
  totalClassrooms,
  conflictsCount,
}: TimetableStatsProps) {
  const t = useTranslations('schedule');

  const stats = [
    {
      title: t('totalPeriods'),
      value: totalPeriods,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: t('activeTeachers'),
      value: totalTeachers,
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: t('classroomsUsed'),
      value: totalClassrooms,
      icon: DoorOpen,
      color: 'text-purple-600',
    },
    {
      title: t('conflicts'),
      value: conflictsCount,
      icon: AlertCircle,
      color: conflictsCount > 0 ? 'text-red-600' : 'text-gray-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

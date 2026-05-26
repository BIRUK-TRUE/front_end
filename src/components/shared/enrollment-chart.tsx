'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EnrollmentChartProps {
  data?: {
    year: string;
    students: number;
  }[];
}

import { useHistoricalEnrollment } from '@/hooks/use-enrollment-stats';
import { Loader2 } from 'lucide-react';

export function EnrollmentChart() {
  const t = useTranslations('dashboard');
  const { data, isLoading } = useHistoricalEnrollment();

  return (
    <Card className="col-span-full lg:col-span-4 shadow-sm border overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <CardTitle>{t('enrollmentTrends')}</CardTitle>
        <CardDescription>{t('enrollmentGrowthDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex h-[300px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
            {t('noEnrollmentData')}
          </div>
        ) : (
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="students" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorStudents)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

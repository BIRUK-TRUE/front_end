'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AttendanceTrendEntry } from "../types";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceTrendChartProps {
  data: AttendanceTrendEntry[];
  isLoading?: boolean;
  days?: number;
  onDaysChange?: (days: number) => void;
}

export function AttendanceTrendChart({ data, isLoading, days = 30, onDaysChange }: AttendanceTrendChartProps) {
  const t = useTranslations("analytics.charts");

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t("attendanceTrend")}</CardTitle>
            <CardDescription>{t("attendanceTrendSubtitle")}</CardDescription>
          </div>
          {onDaysChange && (
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <Button
                  key={d}
                  variant={days === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDaysChange(d)}
                >
                  {d}d
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full" role="img" aria-label="Attendance trends showing present, absent, late, and excused counts over time">
          {isLoading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-[240px] w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg">
              <span className="text-muted-foreground">{t("noDataAvailable")}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}
                  labelFormatter={(val) => format(new Date(val), 'MMMM d, yyyy')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#16A34A" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  strokeDasharray="0"
                  animationDuration={0}
                  name={t("present")}
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#DC2626" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  strokeDasharray="6 4"
                  animationDuration={0}
                  name={t("absent")}
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke="#D97706" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  strokeDasharray="2 4"
                  animationDuration={0}
                  name={t("late")}
                />
                <Line 
                  type="monotone" 
                  dataKey="excused" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  strokeDasharray="10 4 2 4"
                  animationDuration={0}
                  name={t("excused")}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AttendanceTrendEntry } from "../types";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface AttendanceTrendChartProps {
  data: AttendanceTrendEntry[];
  isLoading?: boolean;
}

export function AttendanceTrendChart({ data, isLoading }: AttendanceTrendChartProps) {
  const t = useTranslations("analytics.charts");

  return (
    <Card className="col-span-full lg:col-span-4 shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-lg">{t("attendanceTrend")}</CardTitle>
        <CardDescription>{t("attendanceTrendSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center bg-muted/20 rounded-lg animate-pulse">
              <span className="text-muted-foreground">{t("loadingChartData")}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg">
              <span className="text-muted-foreground">{t("noDataAvailable")}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelFormatter={(val) => format(new Date(val), 'MMMM d, yyyy')}
                  formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Attendance Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

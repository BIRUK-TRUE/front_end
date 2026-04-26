'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AttendanceTrendEntry } from "../types";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface AttendanceTrendChartProps {
  data: AttendanceTrendEntry[];
  isLoading?: boolean;
  days?: number;
  onDaysChange?: (days: number) => void;
}

export function AttendanceTrendChart({ data, isLoading, days = 30, onDaysChange }: AttendanceTrendChartProps) {
  const t = useTranslations("analytics.charts");

  return (
    <Card className="shadow-md border-none">
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
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelFormatter={(val) => format(new Date(val), 'MMMM d, yyyy')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1500}
                  name={t("present")}
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1500}
                  name={t("absent")}
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1500}
                  name={t("late")}
                />
                <Line 
                  type="monotone" 
                  dataKey="excused" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1500}
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

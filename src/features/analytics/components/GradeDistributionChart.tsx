'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { GradeDistributionEntry } from "../types";
import { useTranslations } from "next-intl";

interface GradeDistributionChartProps {
  data: GradeDistributionEntry[];
  isLoading?: boolean;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981', '#059669'];

export function GradeDistributionChart({ data, isLoading }: GradeDistributionChartProps) {
  const t = useTranslations("analytics.charts");

  return (
    <Card className="col-span-full lg:col-span-4 shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-lg">{t("gradeDistribution")}</CardTitle>
        <CardDescription>{t("gradeDistributionSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center bg-muted/20 rounded-lg animate-pulse">
              <span className="text-muted-foreground">{t("loadingChartData")}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg">
              <span className="text-muted-foreground">{t("noDistributionData")}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="range" 
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
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [val, 'Students']}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

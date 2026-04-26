'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import { GradeDistributionEntry } from "../types";
import { useTranslations } from "next-intl";

interface GradeDistributionChartProps {
  data: GradeDistributionEntry[];
  isLoading?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  'A': '#10b981', // green
  'B': '#3b82f6', // blue
  'C': '#f59e0b', // yellow
  'D': '#f97316', // orange
  'F': '#ef4444', // red
};

export function GradeDistributionChart({ data, isLoading }: GradeDistributionChartProps) {
  const t = useTranslations("analytics.charts");

  // Sort data by grade letter (A, B, C, D, F)
  const sortedData = [...data].sort((a, b) => {
    const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
    return gradeOrder.indexOf(a.grade_letter) - gradeOrder.indexOf(b.grade_letter);
  });

  return (
    <Card className="shadow-md border-none">
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
          ) : sortedData.length === 0 ? (
            <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg">
              <span className="text-muted-foreground">{t("noDistributionData")}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="grade_letter" 
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
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade_letter] || '#64748b'} />
                  ))}
                  <LabelList 
                    dataKey="percentage" 
                    position="top" 
                    formatter={(val: any) => `${val}%`}
                    style={{ fontSize: '11px', fill: '#64748b' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

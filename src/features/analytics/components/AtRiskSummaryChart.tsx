'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AnalyticsSummary } from "../types";
import { useTranslations } from "next-intl";

interface AtRiskSummaryChartProps {
  data: AnalyticsSummary['atRiskCounts'];
  isLoading?: boolean;
}

const COLORS = {
  critical: '#ef4444', // Red-500
  high: '#f97316',     // Orange-500
  medium: '#f59e0b',   // Amber-500
  low: '#10b981',      // Emerald-500
};

export function AtRiskSummaryChart({ data, isLoading }: AtRiskSummaryChartProps) {
  const t = useTranslations("analytics.charts");
  const tr = useTranslations("analytics.riskLevels");
  const ta = useTranslations("analytics");

  const chartData = [
    { name: tr("critical"), value: data.critical, key: 'critical' },
    { name: tr("high"), value: data.high, key: 'high' },
    { name: tr("medium"), value: data.medium, key: 'medium' },
    { name: tr("low"), value: data.low, key: 'low' },
  ].filter(d => d.value > 0);

  return (
    <Card className="shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-lg">{t("atRiskBreakdown")}</CardTitle>
        <CardDescription>{ta("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-w-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center bg-muted/20 rounded-lg animate-pulse">
              <span className="text-muted-foreground">{t("loadingChartData")}</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg">
              <span className="text-muted-foreground">{t("allStudentsOnTrack")}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.key as keyof typeof COLORS]} 
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

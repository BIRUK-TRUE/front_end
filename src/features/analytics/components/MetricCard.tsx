import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground leading-tight line-clamp-2">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span className={cn(
                "flex items-center rounded-full border px-1.5 py-0.5 text-xs font-semibold",
                trend.isUp ? "border-success/20 bg-success/10 text-success" : "border-destructive/20 bg-destructive/10 text-destructive"
              )}>
                {trend.isUp ? "+" : "-"}{trend.value}%
              </span>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "../types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const t = useTranslations("analytics.riskLevels");

  const variants = {
    critical: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    high: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-bold px-2.5 py-0.5 whitespace-nowrap", 
        variants[level], 
        className
      )}
    >
      {t(level)}
    </Badge>
  );
}

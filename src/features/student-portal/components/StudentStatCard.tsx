import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StudentStatCardProps {
  title: string;
  value: string | number;
  label: string;
  indicatorColor?: "green" | "yellow" | "red" | "default";
}

export function StudentStatCard({
  title,
  value,
  label,
  indicatorColor = "default",
}: StudentStatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        indicatorColor === "green" && "border-green-500",
        indicatorColor === "yellow" && "border-yellow-500",
        indicatorColor === "red" && "border-red-500"
      )}
    >
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

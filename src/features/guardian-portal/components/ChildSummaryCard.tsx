"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Calendar, Wallet, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChildSummary } from "../types";

interface Props {
  child: ChildSummary;
}

export function ChildSummaryCard({ child }: Props) {
  const t = useTranslations("guardianPortal.dashboard");

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (rate >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getFeeStatusBadge = (status: ChildSummary["fee_status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">{t("feeStatuses.paid")}</Badge>;
      case "partial":
        return <Badge className="bg-amber-500 hover:bg-amber-600">{t("feeStatuses.partial")}</Badge>;
      case "unpaid":
        return <Badge variant="destructive">{t("feeStatuses.unpaid")}</Badge>;
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md border-muted/60">
      <CardHeader className="pb-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
              <AvatarImage src={child.photo_url ?? ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {child.full_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {child.full_name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {child.class_name} - {child.section_name} • {child.student_id}
              </p>
            </div>
          </div>
          {getFeeStatusBadge(child.fee_status)}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {t("stats.attendanceRate")}
              </div>
              <span className={cn("px-2 py-0.5 rounded-full border", getAttendanceColor(child.attendance_rate))}>
                {child.attendance_rate}%
              </span>
            </div>
            <Progress value={child.attendance_rate} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                {t("stats.gradeAverage")}
              </div>
              <span className="font-bold text-foreground">
                {child.grade_average}%
              </span>
            </div>
            <Progress value={child.grade_average} className="h-1.5 bg-primary/10" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button asChild variant="outline" className="flex-1 text-xs gap-2 group/btn h-9">
            <Link href={`/dashboard/guardian/children/${child.id}`}>
              {t("viewDetails")}
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild className="flex-1 text-xs gap-2 h-9 shadow-sm">
            <Link href={`/dashboard/guardian/payments?studentId=${child.id}`}>
              <Wallet className="h-3.5 w-3.5" />
              {t("payFees")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

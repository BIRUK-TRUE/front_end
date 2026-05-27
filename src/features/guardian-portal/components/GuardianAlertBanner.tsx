"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, XCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { ChildSummary } from "../types";

interface Props {
  children: ChildSummary[];
}

export function GuardianAlertBanner({ children }: Props) {
  const t = useTranslations("guardianPortal.alerts");

  const lowAttendance = children.filter((c) => c.attendance_rate < 75);
  const unpaidFees = children.filter((c) => c.fee_status === "unpaid");

  if (lowAttendance.length === 0 && unpaidFees.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {lowAttendance.map((child) => (
        <Alert key={`low-att-${child.id}`} variant="destructive" className="bg-red-50 border-red-200 text-red-900 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">{t("lowAttendance", { name: child.full_name })}</AlertTitle>
          <AlertDescription className="text-xs opacity-90">
            {t("lowAttendanceDesc", { name: child.full_name, rate: child.attendance_rate })}
          </AlertDescription>
        </Alert>
      ))}

      {unpaidFees.map((child) => (
        <Alert key={`unpaid-${child.id}`} variant="destructive" className="bg-orange-50 border-orange-200 text-orange-900 shadow-sm animate-in fade-in slide-in-from-top-2">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">{t("feesOverdue", { name: child.full_name })}</AlertTitle>
          <AlertDescription className="text-xs opacity-90">
            {t("feesOverdueDesc", { name: child.full_name })}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

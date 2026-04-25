import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export function AttendanceWarningBanner({
  rate,
  threshold = 75,
}: {
  rate: number;
  threshold?: number;
}) {
  const t = useTranslations("studentPortal.attendance");

  if (rate >= threshold) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
      <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">
        {t('warningTitle')}
      </AlertTitle>
      <AlertDescription>
        {t("warning", { rate: Math.round(rate) })}
      </AlertDescription>
    </Alert>
  );
}

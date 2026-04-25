import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import type { AttendanceCalendarRecord } from "../types";

export function AttendanceDayPopover({
  record,
  children,
}: {
  record: AttendanceCalendarRecord;
  children: React.ReactNode;
}) {
  const t = useTranslations("studentPortal.attendance.dayPopover");
  const ts = useTranslations("studentPortal.attendance.statuses");

  const statusLabel = {
    present: ts("present"),
    absent: ts("absent"),
    late: ts("late"),
    excused: ts("excused"),
  }[record.status];

  const statusColor = {
    present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    excused: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  }[record.status];

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="center">
        <div className="space-y-3 relative z-50">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("date")}
            </p>
            <p className="text-sm">
               {format(new Date(record.date), "PPP")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("status")}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div>
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("class")}
            </p>
            <p className="text-sm">{record.className}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("note")}
            </p>
            <p className="text-sm italic text-muted-foreground">
              {record.note || t("noNote")}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

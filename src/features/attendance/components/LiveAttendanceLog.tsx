"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendanceStatus } from "../types";

interface LogEntry {
  id: string;
  studentName: string;
  registrationNumber: string;
  time: string;
  status: AttendanceStatus;
  method: "face" | "barcode" | "manual";
}

interface LiveAttendanceLogProps {
  entries: LogEntry[];
  className?: string;
}

export function LiveAttendanceLog({
  entries,
  className,
}: LiveAttendanceLogProps) {
  const t = useTranslations("faceAttendance.station");
  const ta = useTranslations("attendancePage");

  const methodLabels: Record<LogEntry["method"], string> = {
    face: t("faceRecognition"),
    manual: ta("manualEntry"),
    barcode: ta("barcodeId"),
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {t("liveLog")}
          </CardTitle>
          <Badge
            variant="outline"
            className="font-mono"
            aria-label={t("liveLog")}
          >
            {entries.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[500px] w-full">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <History className="h-12 w-12 mb-2 opacity-20" />
              <p>{t("scanning")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((entry) => {
                const initials = entry.studentName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const isLate = entry.status === AttendanceStatus.LATE;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors animate-in slide-in-from-right-4"
                  >
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarFallback
                        className={cn(
                          "font-medium",
                          isLate
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700",
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {entry.studentName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {entry.registrationNumber}
                        </span>
                        <span>•</span>
                        <span>{entry.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "gap-1",
                          isLate
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        )}
                      >
                        {isLate ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {isLate ? ta("late") : ta("present")}
                      </Badge>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">
                        {methodLabels[entry.method]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

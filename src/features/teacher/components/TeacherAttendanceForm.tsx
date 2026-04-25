"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useClassRoster, useTeacherClasses } from "../hooks/useTeacherClasses";
import { useSubmitTeacherAttendance, useTeacherAttendanceRecords } from "../hooks/useTeacherAttendance";
import type { AttendanceStatus } from "../types";

export function TeacherAttendanceForm({ teacherId }: { teacherId: string }) {
  const t = useTranslations("teacher.attendance");
  const tc = useTranslations("common");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(1);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [recordSection, setRecordSection] = useState("");

  const classes = useTeacherClasses(teacherId);
  const roster = useClassRoster(sectionId);
  const submit = useSubmitTeacherAttendance();
  const records = useTeacherAttendanceRecords(teacherId, {
    sectionId: recordSection || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    size: 10,
  });

  const rows = useMemo(() => roster.data?.students ?? [], [roster.data?.students]);

  const updateAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    rows.forEach((student) => {
      next[student.id] = status;
    });
    setStatuses(next);
  };

  const onSubmit = async () => {
    if (!sectionId || rows.length === 0) return;
    const payload = {
      sectionId,
      date,
      records: rows.map((student) => ({
        studentId: student.id,
        status: statuses[student.id] ?? "present",
        note: notes[student.id] || "",
      })),
    };
    try {
      await submit.mutateAsync(payload);
    } catch (error: unknown) {
      const typed = error as { message?: string };
      if (typed.message === "ALREADY_TAKEN") {
        if (window.confirm(t("alreadyTaken"))) {
          toast.info(tc("edit"));
        }
      }
    }
  };

  return (
    <Tabs defaultValue="take" className="space-y-4">
      <TabsList>
        <TabsTrigger value="take">{t("takeAttendance")}</TabsTrigger>
        <TabsTrigger value="records">{t("viewRecords")}</TabsTrigger>
      </TabsList>

      <TabsContent value="take" className="space-y-4 outline-none">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {t("selectClass")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("selectClass")}
                </label>
                <Select value={sectionId} onValueChange={setSectionId}>
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder={t("selectClass")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes.data ?? []).map((item) => (
                      <SelectItem key={item.sectionId} value={item.sectionId}>
                        {item.className} - {item.sectionName} ({item.subjectName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("selectDate")}
                </label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="h-11 shadow-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t("quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="justify-start h-11 border-dashed"
                onClick={() => updateAll("present")}
                disabled={!sectionId}
              >
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                {t("markAllPresent")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="justify-start h-11 border-dashed"
                onClick={() => updateAll("absent")}
                disabled={!sectionId}
              >
                <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                {t("markAllAbsent")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {sectionId && (
          <Card className="shadow-sm border-primary/20">
            <CardContent className="pt-6">
              {roster.isLoading ? (
                <div className="space-y-3 py-8">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : rows.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground italic">{t("noStudents")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[300px] font-bold">{tc("name")}</TableHead>
                          <TableHead className="font-bold">{tc("status")}</TableHead>
                          <TableHead className="font-bold">{tc("notes")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((student) => (
                          <TableRow key={student.id} className="hover:bg-muted/30">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 leading-none">
                                  <AvatarImage src={student.photoUrl ?? ""} />
                                  <AvatarFallback className="text-[10px] font-bold">
                                    {student.fullName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm leading-none">{student.fullName}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{student.studentId}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={statuses[student.id] ?? "present"}
                                onValueChange={(value) =>
                                  setStatuses((prev) => ({
                                    ...prev,
                                    [student.id]: value as AttendanceStatus,
                                  }))
                                }
                              >
                                <SelectTrigger className={cn(
                                  "w-[140px] h-9 font-medium transition-colors",
                                  (statuses[student.id] === "absent") && "border-red-200 bg-red-50 text-red-700",
                                  (statuses[student.id] === "late") && "border-yellow-200 bg-yellow-50 text-yellow-700",
                                  (statuses[student.id] === "excused") && "border-blue-200 bg-blue-50 text-blue-700",
                                  (!statuses[student.id] || statuses[student.id] === "present") && "border-green-200 bg-green-50 text-green-700"
                                )}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present" className="text-green-700">{t("statuses.present")}</SelectItem>
                                  <SelectItem value="absent" className="text-red-700">{t("statuses.absent")}</SelectItem>
                                  <SelectItem value="late" className="text-yellow-700">{t("statuses.late")}</SelectItem>
                                  <SelectItem value="excused" className="text-blue-700">{t("statuses.excused")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder={t("recordNotePlaceholder") || tc("notes")}
                                value={notes[student.id] ?? ""}
                                onChange={(e) =>
                                  setNotes((prev) => ({ ...prev, [student.id]: e.target.value }))
                                }
                                className="h-9 placeholder:text-[10px]"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button 
                      size="lg" 
                      onClick={onSubmit} 
                      disabled={submit.isPending}
                      className="px-8 font-bold"
                    >
                      {submit.isPending ? tc("loading") : t("submit")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="records">
        <Card>
          <CardHeader>
            <CardTitle>{t("viewRecords")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={recordSection} onValueChange={setRecordSection}>
                <SelectTrigger><SelectValue placeholder={t("selectClass")} /></SelectTrigger>
                <SelectContent>
                  {(classes.data ?? []).map((item) => (
                    <SelectItem key={item.sectionId} value={item.sectionId}>
                      {item.className} - {item.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tc("date")}</TableHead>
                  <TableHead>{tc("class")}</TableHead>
                  <TableHead>{tc("status")}</TableHead>
                  <TableHead>{tc("edit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(records.data?.items ?? []).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.className} - {record.sectionName}</TableCell>
                    <TableCell>
                      P:{record.statusCounts.present} A:{record.statusCounts.absent} L:{record.statusCounts.late}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">{tc("edit")}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                {tc("previous")}
              </Button>
              <span className="text-sm">{tc("page")} {page}</span>
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                {tc("next")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

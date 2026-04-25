"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useChildAttendance } from "../hooks/useChildDetails";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  studentId: string;
}

export function GuardianAttendanceView({ studentId }: Props) {
  const t = useTranslations("guardianPortal.childDetail");
  const ta = useTranslations("guardianPortal.childDetail.attendanceTab");
  const tc = useTranslations("common");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useChildAttendance(studentId, { page, size: 10 });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present": return "bg-green-100 text-green-700 border-green-200";
      case "absent": return "bg-red-100 text-red-700 border-red-200";
      case "late": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "excused": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{ta("attendanceRecords")}</CardTitle>
      </CardHeader>
      <CardContent>
        {(!data || data.items.length === 0) ? (
          <p className="text-sm text-center py-10 text-muted-foreground italic">{ta("noAttendanceRecords")}</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">{ta("date")}</TableHead>
                  <TableHead className="font-bold">{ta("status")}</TableHead>
                  <TableHead className="font-bold">{ta("subject")}</TableHead>
                  <TableHead className="font-bold">{ta("remarks")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "PPP")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-bold", getStatusColor(record.status))}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.className || ta("general")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground italic max-w-[200px] truncate">
                      {record.note || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

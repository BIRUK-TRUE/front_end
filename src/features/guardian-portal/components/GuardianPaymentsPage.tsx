"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CreditCard, Users } from "lucide-react";
import { useMyChildren } from "../hooks/useMyChildren";
import { GuardianFeesView } from "./GuardianFeesView";
import { Skeleton } from "@/components/ui/skeleton";

export function GuardianPaymentsPage() {
  const t = useTranslations("guardianPortal.payments");
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId");
  
  const { data: children, isLoading } = useMyChildren();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    } else if (children && children.length > 0 && !selectedStudentId) {
      setSelectedStudentId(children[0].id);
    }
  }, [children, initialStudentId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("manageFees")}</p>
        </div>

        {children && children.length > 1 && (
          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
            <Users className="h-4 w-4 text-muted-foreground ml-2" />
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder={t("selectChild")} />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedStudentId ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground italic">{t("selectChildPrompt")}</p>
          </CardContent>
        </Card>
      ) : (
        <GuardianFeesView 
          studentId={selectedStudentId} 
          studentName={children?.find(c => c.id === selectedStudentId)?.fullName} 
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, History, Wallet, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useFeeBalance, usePaymentHistory } from "../hooks/useGuardianPayments";
import { ChapaPaymentModal } from "../../payments/components/ChapaPaymentModal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  studentId: string;
  studentName?: string;
}

export function GuardianFeesView({ studentId, studentName }: Props) {
  const t = useTranslations("guardianPortal.payments");
  const tc = useTranslations("common");
  const { data: balance, isLoading: loadingBalance, refetch: refetchBalance } = useFeeBalance(studentId);
  const { data: history, isLoading: loadingHistory, refetch: refetchHistory } = usePaymentHistory(studentId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  if (loadingBalance || loadingHistory) {
    return <Skeleton className="h-96 w-full" />;
  }

  const totalPages = history ? Math.ceil(history.length / ITEMS_PER_PAGE) : 1;
  const startIndex = (historyPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history ? history.slice(startIndex, startIndex + ITEMS_PER_PAGE) : [];

  const handlePayClick = (feeId: string) => {
    setSelectedFeeId(feeId);
    setIsModalOpen(true);
  };

  const onRefresh = () => {
    refetchBalance();
    refetchHistory();
  };

  // Adapter for ChapaPaymentModal which expects a specific LinkedStudent type
  // We'll mock the missing properties needed by the modal if necessary
  const studentAdapter = {
    id: studentId,
    name: studentName || "Student",
    registration_number: studentId,
    class_name: "",
    section_name: "",
    total_balance: balance?.outstanding || 0,
    fees: (balance?.breakdown || []).map(f => ({
      id: f.id,
      fee_type: f.type,
      amount: f.amount,
      paid: f.paid,
      balance: f.balance,
      due_date: f.dueDate,
      status: (f.balance === 0 ? 'paid' : f.balance < f.amount ? 'partial' : 'unpaid') as any
    }))
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-20 w-20" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("totalFees")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">ETB {balance?.total.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-700/70">{t("amountPaid")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-700">ETB {balance?.paid.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 border-red-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-700/70">{t("outstanding")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-red-700">ETB {balance?.outstanding.toLocaleString()}</p>
              {balance?.dueDate && (
                <p className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase mb-1">
                   {t("dueDate")}: {format(new Date(balance.dueDate), "MMM d")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t("feeBalance")}
          </CardTitle>
          <CardDescription>{t("feeBreakdown")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">{t("type")}</TableHead>
                  <TableHead className="font-bold">{t("total")}</TableHead>
                  <TableHead className="font-bold">{t("paid")}</TableHead>
                  <TableHead className="font-bold">{t("remaining")}</TableHead>
                  <TableHead className="text-right font-bold w-[120px]">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(balance?.breakdown || []).map((fee) => (
                  <TableRow key={fee.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{fee.type}</TableCell>
                    <TableCell>ETB {fee.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">ETB {fee.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600 font-bold">ETB {fee.balance.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {fee.balance > 0 ? (
                        <Button size="sm" onClick={() => handlePayClick(fee.id)} className="h-8 text-xs font-bold gap-1.5 shadow-sm">
                          <CreditCard className="h-3 w-3" />
                          {t("makePayment")}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 uppercase text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("paidStatus")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {t("paymentHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {(!history || history.length === 0) ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground italic">{t("noPayments")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden">
               <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">{t("date")}</TableHead>
                    <TableHead className="font-bold">{t("amount")}</TableHead>
                    <TableHead className="font-bold">{t("method")}</TableHead>
                    <TableHead className="font-bold">{t("status")}</TableHead>
                    <TableHead className="text-right font-bold">{t("receipt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.map((pay) => (
                    <TableRow key={pay.id} className="hover:bg-muted/30">
                      <TableCell>{format(new Date(pay.date), "PPP")}</TableCell>
                      <TableCell className="font-bold">ETB {pay.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm font-medium">{pay.method}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] font-bold",
                          pay.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                          pay.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {pay.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10 text-xs font-bold" asChild>
                          <a href={pay.receiptUrl} target="_blank" rel="noopener noreferrer">
                            {t("downloadReceipt")}
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  {t("showing", { start: startIndex + 1, end: Math.min(startIndex + ITEMS_PER_PAGE, history.length), total: history.length })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {historyPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                    disabled={historyPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && selectedFeeId && (
        <ChapaPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          student={studentAdapter as any}
          feeId={selectedFeeId}
          onSuccess={() => {
            onRefresh();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

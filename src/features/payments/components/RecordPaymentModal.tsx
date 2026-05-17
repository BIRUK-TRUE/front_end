"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreatePayment } from "../api/usePayments";
import { PaymentMethod } from "../types";

const recordPaymentSchema = z.object({
  fee_id: z.string().min(1, "Fee is required"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  payment_method: z.nativeEnum(PaymentMethod),
  reference_number: z.string().min(1, "Reference number is required"),
});

type RecordPaymentForm = z.infer<typeof recordPaymentSchema>;

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  fees: Array<{ id: string; name: string; amount: number; balance: number }>;
  onSubmit?: () => void;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  fees,
  onSubmit,
}: RecordPaymentModalProps) {
  const t = useTranslations("payments");
  const tc = useTranslations("common");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      payment_method: PaymentMethod.CASH,
    },
  });

  const createPayment = useCreatePayment();
  const selectedFeeId = watch("fee_id");
  const selectedFee = fees.find((f) => f.id === selectedFeeId);

  const handleFormSubmit = async (data: RecordPaymentForm) => {
    await createPayment.mutateAsync(data as any);
    onSubmit?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("recordPayment")}</DialogTitle>
          <DialogDescription>
            {t("recordPaymentFor", { name: studentName })}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit as any)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="fee_id">{t("selectFee")} *</Label>
            <Select onValueChange={(value) => setValue("fee_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectFee")} />
              </SelectTrigger>
              <SelectContent>
                {fees.map((fee) => (
                  <SelectItem key={fee.id} value={fee.id}>
                    {fee.name} - {fee.balance.toLocaleString()} ETB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fee_id && (
              <p className="text-sm text-destructive">
                {errors.fee_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")} *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder={
                selectedFee ? selectedFee.balance.toString() : "0.00"
              }
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">{t("paymentMethod")} *</Label>
            <Select
              defaultValue={PaymentMethod.CASH}
              onValueChange={(value) =>
                setValue("payment_method", value as PaymentMethod)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentMethod.CASH}>{t("cash")}</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                  {t("bankTransfer")}
                </SelectItem>
                <SelectItem value={PaymentMethod.CHECK}>
                  {t("check")}
                </SelectItem>
                <SelectItem value={PaymentMethod.MOBILE_MONEY}>
                  {t("mobileMoney")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">{t("referenceNumber")} *</Label>
            <Input
              id="reference_number"
              {...register("reference_number")}
              placeholder={t("referencePlaceholder")}
            />
            {errors.reference_number && (
              <p className="text-sm text-destructive">
                {errors.reference_number.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPayment.isPending}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tc("loading")}
                </>
              ) : (
                t("recordPayment")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

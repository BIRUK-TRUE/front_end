'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Shield,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useInitiateChapaPayment, useVerifyChapaPayment } from '../api/usePayments';
import type { LinkedStudent } from '../types';

interface ChapaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: LinkedStudent;
  feeId: string;
  onSuccess: () => void;
}

export function ChapaPaymentModal({ isOpen, onClose, student, feeId, onSuccess }: ChapaPaymentModalProps) {
  const t = useTranslations('guardianPortal.dashboard.chapa');
  const [amount, setAmount] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [status, setStatus] = useState<'form' | 'processing' | 'success' | 'error'>('form');

  const initiatePayment = useInitiateChapaPayment();
  const verifyPayment = useVerifyChapaPayment();

  const fee = student.fees.find((f) => f.id === feeId);
  const maxAmount = fee?.balance || 0;

  const handleInitiatePayment = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || numAmount > maxAmount) {
      toast.error(t('invalidAmount'));
      return;
    }

    setStatus('processing');

    try {
      const response = await initiatePayment.mutateAsync({
        fee_id: feeId,
        amount: String(numAmount),
      });

      // Backend returns { checkout_url, tx_ref, ... } directly
      const checkoutUrl: string | undefined = response?.checkout_url;
      const ref: string | undefined = response?.tx_ref;

      if (ref) setTxRef(ref);

      if (checkoutUrl) {
        setPaymentUrl(checkoutUrl);
        window.open(checkoutUrl, '_blank');
      } else {
        setStatus('error');
        toast.error(t('initiateFailed'));
      }
    } catch {
      setStatus('error');
      toast.error(t('initiateFailed'));
    }
  };

  const handleVerify = async () => {
    if (!txRef) return;
    
    try {
      await verifyPayment.mutateAsync({ reference: txRef });
      setStatus('success');
      onSuccess();
    } catch {
      toast.error(t('verificationFailed'));
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'form':
        return (
          <div className="space-y-4">
            {/* Fee Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('student')}</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('outstandingBalance')}</p>
                    <p className="text-xl font-bold text-destructive">
                      ETB {maxAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>{t('paymentAmount')}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('enterAmount', { max: maxAmount })}
                  min={1}
                  max={maxAmount}
                />
                <Button
                  variant="outline"
                  onClick={() => setAmount(String(maxAmount))}
                  className="whitespace-nowrap"
                >
                  {t('payFull')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('partialPaymentNote')}
              </p>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">
                {t('securityNotice')}
              </p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium">{t('processingPayment')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('completePaymentWindow')}
                </p>
              </div>
              <Badge variant="outline" className="font-mono">
                Ref: {txRef}
              </Badge>
            </div>

            {paymentUrl && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(paymentUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                {t('openPaymentAgain')}
              </Button>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button className="flex-1 gap-2" onClick={handleVerify}>
                <CheckCircle2 className="h-4 w-4" />
                {t('completedPayment')}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">{t('paymentSuccessful')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('paymentReceived', { amount: Number(amount).toLocaleString() })}
                </p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                {t('transactionRef', { ref: txRef || '' })}
              </Badge>
            </div>

            <Button className="w-full" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <p className="font-medium">{t('paymentFailed')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('paymentError')}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button className="flex-1" onClick={() => setStatus('form')}>
                {t('tryAgain')}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#1DA1F2]/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-[#1DA1F2]" />
            </div>
            <DialogTitle>{t('payWithChapa')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('securePayment')}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        {status === 'form' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleInitiatePayment}
              disabled={initiatePayment.isPending || !amount}
              className="gap-2"
            >
              {initiatePayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {t('proceedToPayment')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

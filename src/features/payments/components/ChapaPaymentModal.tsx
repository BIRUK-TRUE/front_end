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
import { Label } from '@/components/ui/label';
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
import { useAuthStore } from '@/lib/store/auth-store';

interface ChapaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: LinkedStudent;
  feeId: string;
  onSuccess: () => void;
}

export function ChapaPaymentModal({ isOpen, onClose, student, feeId, onSuccess }: ChapaPaymentModalProps) {
  const t = useTranslations('guardianPortal.dashboard.chapa');
  const { user } = useAuthStore();
  const guardianId = user?.id ?? '';
  const [amount, setAmount] = useState<string>('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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

    if (!email || !firstName || !lastName) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    const reference = `SCHFEE-${Date.now()}-${guardianId.slice(0, 6)}`;
    setTxRef(reference);
    setStatus('processing');

    try {
      const payload = {
        amount: String(numAmount),
        currency: 'ETB',
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: reference,
        callback_url: `${window.location.origin}/api/payments/chapa/callback`,
        return_url: `${window.location.origin}/dashboard/payments/success?ref=${reference}`,
        customization: {
          title: t('schoolFeePayment'),
          description: t('paymentFor', { name: student.name, fee: fee?.fee_type }),
        },
        fee_id: feeId,
      };

      const response = await initiatePayment.mutateAsync(payload);
      
      if (response.data?.checkout_url) {
        setPaymentUrl(response.data.checkout_url);
        // Open Chapa in new window
        window.open(response.data.checkout_url, '_blank');
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

            {/* Personal Info */}
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('firstName')}</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('lastName')}</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('lastName')}
                />
              </div>
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
              disabled={
                initiatePayment.isPending ||
                !amount ||
                !email ||
                !firstName ||
                !lastName
              }
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

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { withdrawalSchema, type WithdrawalForm } from '../types/schemas';
import { type Enrollment } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: Enrollment | null;
  onSubmit: (data: WithdrawalForm) => void;
  isLoading?: boolean;
}

export function WithdrawModal({
  open,
  onOpenChange,
  enrollment,
  onSubmit,
  isLoading,
}: WithdrawModalProps) {
  const t = useTranslations('common');
  
  const form = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema) as any,
    defaultValues: {
      withdrawal_date: format(new Date(), 'yyyy-MM-dd'),
      reason: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        withdrawal_date: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
      });
    }
  }, [open, form]);

  const handleSubmit = (data: WithdrawalForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Withdraw Student
          </DialogTitle>
          <DialogDescription>
            You are about to withdraw <strong>{enrollment?.student_name}</strong> from <strong>{enrollment?.academic_year_name}</strong>. This action is significant.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <FormField
              control={form.control}
              name="withdrawal_date"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Withdrawal Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Reason for Withdrawal</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide a reason for withdrawal" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Withdrawal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

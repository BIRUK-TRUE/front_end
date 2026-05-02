'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { type FeeConfig, FeeType, CreateFeeConfig } from '../types';

const feeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(FeeType),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  term_id: z.string().optional(),
  grade_level: z.string().optional(),
  due_date: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FeeForm = z.infer<typeof feeSchema>;

interface FeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: FeeConfig | null;
  years: Array<{ id: string; name: string }>;
  terms: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateFeeConfig) => void;
  isLoading: boolean;
}

export function FeeModal({
  open,
  onOpenChange,
  fee,
  years,
  terms,
  onSubmit,
  isLoading,
}: FeeModalProps) {
  const t = useTranslations('fees');
  const tc = useTranslations('common');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeeForm>({
    resolver: zodResolver(feeSchema),
    defaultValues: fee ? {
      name: fee.name,
      type: fee.type,
      amount: fee.amount,
      academic_year_id: fee.academic_year_id,
      term_id: fee.term_id || '',
      grade_level: fee.grade_level || '',
      due_date: fee.due_date || '',
      description: fee.description || '',
      is_active: fee.is_active,
    } : {
      type: FeeType.TUITION,
      is_active: true,
    },
  });

  const is_active = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{fee ? t('editFee') : t('createFee')}</DialogTitle>
          <DialogDescription>
            {fee ? t('editFeeDescription') : t('createFeeDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')} *</Label>
            <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t('type')} *</Label>
              <Select
                defaultValue={fee?.type || FeeType.TUITION}
                onValueChange={(value) => setValue('type', value as FeeType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FeeType.TUITION}>{t('tuition')}</SelectItem>
                  <SelectItem value={FeeType.REGISTRATION}>{t('registration')}</SelectItem>
                  <SelectItem value={FeeType.EXAM}>{t('exam')}</SelectItem>
                  <SelectItem value={FeeType.LIBRARY}>{t('library')}</SelectItem>
                  <SelectItem value={FeeType.LAB}>{t('lab')}</SelectItem>
                  <SelectItem value={FeeType.TRANSPORT}>{t('transport')}</SelectItem>
                  <SelectItem value={FeeType.OTHER}>{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('amount')} *</Label>
              <Input id="amount" type="number" {...register('amount')} aria-invalid={!!errors.amount} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academic_year_id">{t('academicYear')} *</Label>
              <Select
                defaultValue={fee?.academic_year_id}
                onValueChange={(value) => setValue('academic_year_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectYear')} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term_id">{t('term')}</Label>
              <Select
                defaultValue={fee?.term_id || ''}
                onValueChange={(value) => setValue('term_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectTerm')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allTerms')}</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade_level">{t('gradeLevel')}</Label>
            <Input id="grade_level" {...register('grade_level')} placeholder={t('allGrades')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">{t('dueDate')}</Label>
            <Input id="due_date" type="date" {...register('due_date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Input id="description" {...register('description')} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={is_active}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">{t('active')}</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {tc('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tc('loading')}
                </>
              ) : (
                tc('save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

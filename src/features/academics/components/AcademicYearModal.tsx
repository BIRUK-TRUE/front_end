'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { academicYearSchema, type AcademicYearForm } from '@/features/academics/types/schemas';
import { type AcademicYear } from '@/features/academics/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Copy, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format, addYears, parseISO } from 'date-fns';

interface AcademicYearModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year?: AcademicYear | null;
  /** All existing years — used to populate the "clone from" selector */
  existingYears?: AcademicYear[];
  onSubmit: (data: AcademicYearForm & { clone_from_year_id?: string }) => void;
  isLoading?: boolean;
}

// ── Helper: shift a date string by +1 year ────────────────────────────────────
function shiftOneYear(dateStr: string): string {
  try {
    return format(addYears(parseISO(dateStr), 1), 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

// ── Helper: derive a suggested name from a source year name ──────────────────
// e.g. "2023-2024" → "2024-2025", "2023/24" → "2024/25"
function suggestNextName(name: string): string {
  // Pattern: YYYY-YYYY or YYYY/YYYY
  const match = name.match(/(\d{4})[-\/](\d{4})/);
  if (match) {
    const y1 = parseInt(match[1]) + 1;
    const y2 = parseInt(match[2]) + 1;
    const sep = name.includes('/') ? '/' : '-';
    return `${y1}${sep}${y2}`;
  }
  // Pattern: YYYY/YY
  const shortMatch = name.match(/(\d{4})\/(\d{2})/);
  if (shortMatch) {
    const y1 = parseInt(shortMatch[1]) + 1;
    const y2 = (parseInt(shortMatch[2]) + 1) % 100;
    return `${y1}/${String(y2).padStart(2, '0')}`;
  }
  return '';
}

export function AcademicYearModal({
  open,
  onOpenChange,
  year,
  existingYears = [],
  onSubmit,
  isLoading,
}: AcademicYearModalProps) {
  const [cloneEnabled, setCloneEnabled] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');

  const isEditing = !!year;

  const form = useForm<AcademicYearForm>({
    resolver: zodResolver(academicYearSchema) as any,
    defaultValues: {
      name: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
      description: '',
    },
  });

  // ── Reset form when modal opens / year changes ────────────────────────────
  useEffect(() => {
    if (!open) return;

    setCloneEnabled(false);
    setCloneSourceId('');

    if (year) {
      form.reset({
        name: year.name,
        start_date: year.start_date.split('T')[0],
        end_date: year.end_date.split('T')[0],
        description: year.description || '',
      });
    } else {
      // Default: pre-select the most recent year as clone source
      const sorted = [...existingYears].sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
      const latest = sorted[0];
      if (latest) setCloneSourceId(latest.id);

      form.reset({
        name: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
        description: '',
      });
    }
  }, [open, year]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── When clone source changes, pre-fill dates + name ─────────────────────
  useEffect(() => {
    if (!cloneEnabled || !cloneSourceId) return;

    const source = existingYears.find((y) => y.id === cloneSourceId);
    if (!source) return;

    const newStart = shiftOneYear(source.start_date.split('T')[0]);
    const newEnd = shiftOneYear(source.end_date.split('T')[0]);
    const suggestedName = suggestNextName(source.name);

    form.setValue('start_date', newStart);
    form.setValue('end_date', newEnd);
    if (suggestedName) form.setValue('name', suggestedName);
  }, [cloneEnabled, cloneSourceId, existingYears]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── When clone is turned off, reset to blank defaults ────────────────────
  useEffect(() => {
    if (cloneEnabled) return;
    if (isEditing) return; // don't reset when editing
    form.setValue('name', '');
    form.setValue('start_date', format(new Date(), 'yyyy-MM-dd'));
    form.setValue('end_date', format(addYears(new Date(), 1), 'yyyy-MM-dd'));
  }, [cloneEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (data: AcademicYearForm) => {
    onSubmit({
      ...data,
      ...(cloneEnabled && cloneSourceId ? { clone_from_year_id: cloneSourceId } : {}),
    });
  };

  const cloneSource = existingYears.find((y) => y.id === cloneSourceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Academic Year' : 'Create New Academic Year'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the name, dates, or description for this academic year.'
              : "Enter the year details. After creating, you'll be guided to add terms and classes."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">

            {/* ── Clone toggle — only shown when creating and years exist ── */}
            {!isEditing && existingYears.length > 0 && (
              <>
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-semibold cursor-pointer" htmlFor="clone-toggle">
                          Clone from a previous year
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Copy term structure and pre-fill dates automatically.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="clone-toggle"
                      checked={cloneEnabled}
                      onCheckedChange={setCloneEnabled}
                    />
                  </div>

                  {cloneEnabled && (
                    <div className="space-y-2 pt-1">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Copy structure from
                      </Label>
                      <Select value={cloneSourceId} onValueChange={setCloneSourceId}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a year to clone…" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...existingYears]
                            .sort(
                              (a, b) =>
                                new Date(b.start_date).getTime() -
                                new Date(a.start_date).getTime()
                            )
                            .map((y) => (
                              <SelectItem key={y.id} value={y.id}>
                                {y.name}
                                {y.is_current && (
                                  <span className="ml-2 text-[10px] text-primary font-semibold">
                                    current
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {cloneSource && (
                        <div className="flex items-start gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary">
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>
                            Dates will be shifted +1 year from{' '}
                            <strong>{cloneSource.name}</strong>. Term structure (
                            {cloneSource.term_count} term
                            {cloneSource.term_count !== 1 ? 's' : ''}) will be copied after
                            creation.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* ── Year name ── */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>
                    Year Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 2024-2025"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Dates ── */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>
                      End Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Description ── */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>
                    Description{' '}
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about this academic year…"
                      className="resize-none"
                      rows={2}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? 'Save Changes'
                  : cloneEnabled
                  ? 'Create & Clone'
                  : 'Create Year'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

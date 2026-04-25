'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear } from '@/features/academics/api/useAcademicYears';
import { type AcademicYearForm } from '@/features/academics/types/schemas';
import { type AcademicYear, AcademicYearStatus } from '@/features/academics/types';
import { AcademicYearModal } from '@/features/academics/components/AcademicYearModal';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar, MoreHorizontal, Edit, CheckCircle, ChevronRight, Archive } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function AcademicYearsPage() {
  const t = useTranslations('academicsPages');
  const router = useRouter();
  
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const { data, isLoading } = useAcademicYears(page, 20);

  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();

  const openCreateModal = () => {
    setEditingYear(null);
    setIsModalOpen(true);
  };

  const openEditModal = (year: AcademicYear) => {
    setEditingYear(year);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: AcademicYearForm) => {
    try {
      if (editingYear) {
        await updateYear.mutateAsync({ id: editingYear.id, data: formData });
      } else {
        await createYear.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleActivate = async (id: string) => {
    await updateYear.mutateAsync({
      id,
      data: { status: AcademicYearStatus.ACTIVE, is_current: true } as any
    });
  };

  const getStatusBadge = (status: AcademicYearStatus, isCurrent: boolean) => {
    if (isCurrent) {
      return <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">{t('currentActiveYear')}</Badge>;
    }
    
    switch (status) {
      case AcademicYearStatus.PLANNING:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">{t('planning')}</Badge>;
      case AcademicYearStatus.ACTIVE:
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">{t('active')}</Badge>;
      case AcademicYearStatus.COMPLETED:
        return <Badge variant="outline" className="bg-info/10 text-info border-info/30">{t('completed')}</Badge>;
      case AcademicYearStatus.ARCHIVED:
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">{t('archived')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('academicYearsTitle')}
        description={t('academicYearsDescription')}
        actions={
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            {t('createYear')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : !data?.items?.length ? (
              <EmptyState
                icon={Calendar}
                title={t('noAcademicYearsTitle')}
                description={t('noAcademicYearsDescription')}
                action={
                  <Button onClick={openCreateModal}>{t('createAcademicYear')}</Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('yearName')}</TableHead>
                    <TableHead>{t('timeline')}</TableHead>
                    <TableHead>{t('terms')}</TableHead>
                    <TableHead>{t('classes')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((year) => (
                    <TableRow 
                      key={year.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/academics/years/${year.id}`)}
                    >
                      <TableCell className="font-medium text-base">
                        {year.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {year.term_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {year.class_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(year.status, year.is_current)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 shadow-none"
                            onClick={() => router.push(`/dashboard/academics/years/${year.id}`)}
                          >
                            {t('manage')}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">{t('openMenu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem
                                onClick={() => openEditModal(year)}
                              >
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                {t('editDetails')}
                              </DropdownMenuItem>
                              
                              {!year.is_current && year.status !== AcademicYearStatus.COMPLETED && year.status !== AcademicYearStatus.ARCHIVED && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleActivate(year.id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                    {t('setAsCurrent')}
                                  </DropdownMenuItem>
                                </>
                              )}

                              {year.status === AcademicYearStatus.COMPLETED && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-muted-foreground">
                                    <Archive className="mr-2 h-4 w-4" />
                                    {t('archiveYear')}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <AcademicYearModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        year={editingYear}
        onSubmit={handleModalSubmit}
        isLoading={createYear.isPending || updateYear.isPending}
      />
    </div>
  );
}

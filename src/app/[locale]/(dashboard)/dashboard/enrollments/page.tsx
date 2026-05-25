'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useEnrollments, useTransferStudent, useWithdrawStudent, useUpdateEnrollment, useDeleteEnrollment } from '@/features/enrollments/api/useEnrollments';
import { type Enrollment } from '@/features/enrollments/types';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  History, 
  MoreHorizontal, 
  ArrowRightLeft, 
  UserMinus,
  Loader2,
  FilterX
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';
import { EmptyState } from '@/components/shared/empty-state';
import { TransferModal } from '@/features/enrollments/components/TransferModal';
import { WithdrawModal } from '@/features/enrollments/components/WithdrawModal';
import { EditEnrollmentModal } from '@/features/enrollments/components/EditEnrollmentModal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

export default function EnrollmentsPage() {
  const t = useTranslations('enrollments');
  const tc = useTranslations('common');
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data: yearsData } = useAcademicYears(1, 50);
  
  // Get current year as default filter to ensure data loads
  const currentYear = yearsData?.items?.find(y => y.is_current);
  const effectiveYearFilter = yearFilter === 'all' && currentYear ? currentYear.id : yearFilter;
  
  const enrollmentFilters = {
    page,
    search: debouncedSearch || undefined,
    yearId: effectiveYearFilter !== 'all' ? effectiveYearFilter : undefined, // Fixed: was academic_year_id
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { data: enrollmentsData, isLoading } = useEnrollments(enrollmentFilters);
  
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const transferStudent = useTransferStudent(selectedEnrollment?.id || '');
  const withdrawStudent = useWithdrawStudent(selectedEnrollment?.id || '');
  const updateEnrollment = useUpdateEnrollment();
  const deleteEnrollment = useDeleteEnrollment();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteEnrollmentId, setDeleteEnrollmentId] = useState<string | null>(null);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setYearFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-base">
            {row.original.full_name}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            ID: {row.original.id.split('-')[0].toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'academic_year_name',
      header: 'Academic Year',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
          {row.original.academic_year_name}
        </Badge>
      ),
    },
    {
      id: 'class_section',
      header: 'Class & Section',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.class_name}</span>
          <span className="text-sm text-muted-foreground">Section: {row.original.section_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'enrollment_date',
      header: 'Enrollment Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.enrollment_date), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          className="capitalize"
          variant={
            row.original.status === 'active' ? 'default' : 
            row.original.status === 'withdrawn' ? 'destructive' : 
            'secondary'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/students/${enrollment.student_id}`} className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Student History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedEnrollment(enrollment);
                  setIsEditModalOpen(true);
                }}
              >
                {t('editEnrollment')}
              </DropdownMenuItem>
              {enrollment.status === 'active' && (
                <>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setIsTransferModalOpen(true);
                    }}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    {t('transferStudent')}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setIsWithdrawModalOpen(true);
                    }}
                  >
                    <UserMinus className="h-4 w-4" />
                    {t('withdrawStudent')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={() => setDeleteEnrollmentId(enrollment.id)}
              >
                {t('deleteEnrollment')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button className="gap-2" asChild>
            <Link href="/dashboard/students">
              <Plus className="h-4 w-4" />
              {t('enrollStudent')}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{t('searchStudent')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchEnrollments')}
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-56 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{t('academicYear')}</label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('allYears')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allAcademicYears')}</SelectItem>
              {yearsData?.items?.map((year) => (
                <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{tc('status')}</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('statusActive')}</SelectItem>
              <SelectItem value="withdrawn">{t('statusWithdrawn')}</SelectItem>
              <SelectItem value="transferred">{t('statusTransferred')}</SelectItem>
              <SelectItem value="completed">{t('statusCompleted')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(search || yearFilter !== 'all' || statusFilter !== 'all') && (
          <Button 
            variant="ghost" 
            onClick={handleResetFilters}
            className="h-11 px-3 text-muted-foreground hover:text-foreground"
          >
            <FilterX className="h-4 w-4 mr-2" />
            {tc('reset')}
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={enrollmentsData?.items || []}
          isLoading={isLoading}
          manualPagination
          pageCount={enrollmentsData?.pages || 1}
          pagination={{ pageIndex: page - 1, pageSize: 20 }}
          onPaginationChange={(updater) => {
            if (typeof updater === 'function') {
              const newState = updater({ pageIndex: page - 1, pageSize: 20 });
              setPage(newState.pageIndex + 1);
            } else {
              setPage(updater.pageIndex + 1);
            }
          }}
          emptyState={
            <EmptyState
              icon={History}
              title={t('noEnrollments')}
              description={t('noEnrollmentsForFilters')}
              action={
                <Button variant="outline" onClick={handleResetFilters}>
                  {t('clearAllFilters')}
                </Button>
              }
            />
          }
        />
      </div>

      <TransferModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        enrollment={selectedEnrollment}
        onSubmit={async (data) => {
          await transferStudent.mutateAsync(data);
          setIsTransferModalOpen(false);
        }}
        isLoading={transferStudent.isPending}
      />

      <WithdrawModal
        open={isWithdrawModalOpen}
        onOpenChange={setIsWithdrawModalOpen}
        enrollment={selectedEnrollment}
        onSubmit={async (data) => {
          await withdrawStudent.mutateAsync(data);
          setIsWithdrawModalOpen(false);
        }}
        isLoading={withdrawStudent.isPending}
      />

      <EditEnrollmentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        enrollment={selectedEnrollment}
        onSubmit={async (data) => {
          await updateEnrollment.mutateAsync({ id: selectedEnrollment?.id || '', data });
          setIsEditModalOpen(false);
        }}
        isLoading={updateEnrollment.isPending}
      />

      <ConfirmDialog
        open={!!deleteEnrollmentId}
        onOpenChange={(open) => { if (!open) setDeleteEnrollmentId(null); }}
        onConfirm={async () => {
          if (deleteEnrollmentId) {
            await deleteEnrollment.mutateAsync(deleteEnrollmentId);
            setDeleteEnrollmentId(null);
          }
        }}
        title={t('deleteEnrollmentTitle')}
        description={t('deleteEnrollmentDescription')}
        isLoading={deleteEnrollment.isPending}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ProtectedRoute } from '@/components/auth/protected-route';
import { 
  Search, 
  Plus, 
  History, 
  MoreHorizontal, 
  ArrowRightLeft, 
  UserMinus,
  Loader2,
  FilterX,
  Download,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Info
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';
import { EmptyState } from '@/components/shared/empty-state';
import { TransferModal } from '@/features/enrollments/components/TransferModal';
import { WithdrawModal } from '@/features/enrollments/components/WithdrawModal';
import { EditEnrollmentModal } from '@/features/enrollments/components/EditEnrollmentModal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function EnrollmentsPage() {
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
    size: 20,
    search: debouncedSearch || undefined,
    yearId: effectiveYearFilter !== 'all' ? effectiveYearFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { data: enrollmentsData, isLoading, isError } = useEnrollments(enrollmentFilters);
  
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

  // Calculate quick stats from current data
  const stats = useMemo(() => {
    const items = enrollmentsData?.items || [];
    return {
      total: enrollmentsData?.total || 0,
      active: items.filter(e => e.status === 'active').length,
      withdrawn: items.filter(e => e.status === 'withdrawn').length,
      transferred: items.filter(e => e.status === 'transferred').length,
    };
  }, [enrollmentsData]);

  const hasActiveFilters = search || yearFilter !== 'all' || statusFilter !== 'all';

  const columns: ColumnDef<any>[] = [
    {
      id: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Link 
            href={`/dashboard/students/${row.original.student_id}`}
            className="font-semibold text-foreground text-base hover:text-primary transition-colors hover:underline"
          >
            {row.original.student_name}
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.student_registration_number}
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
          <span className="font-medium text-sm">{row.original.class_name}</span>
          <span className="text-xs text-muted-foreground">Section {row.original.section_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'enrollment_date',
      header: 'Enrolled On',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {format(new Date(row.original.enrollment_date), 'MMM d, yyyy')}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {row.original.enrollment_type || 'new'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variantMap: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
          active: 'default',
          withdrawn: 'destructive',
          transferred: 'secondary',
          graduated: 'outline',
          promoted: 'outline',
        };
        
        return (
          <Badge 
            className="capitalize"
            variant={variantMap[status] || 'secondary'}
          >
            {t(`status${status.charAt(0).toUpperCase() + status.slice(1)}` as any) || status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const enrollment = row.original;
        const isActive = enrollment.status === 'active';
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Quick Actions
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/students/${enrollment.student_id}`} className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" />
                  View Student Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedEnrollment(enrollment);
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
                {t('editEnrollment') || 'Edit Remarks'}
              </DropdownMenuItem>
              
              {isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                    Status Changes
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setIsTransferModalOpen(true);
                    }}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    {t('transferStudent') || 'Transfer Student'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setIsWithdrawModalOpen(true);
                    }}
                  >
                    <UserMinus className="h-4 w-4" />
                    {t('withdrawStudent') || 'Withdraw Student'}
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={() => setDeleteEnrollmentId(enrollment.id)}
              >
                <Trash2 className="h-4 w-4" />
                {t('deleteEnrollment') || 'Delete Enrollment'}
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
        title={t('title') || 'Student Enrollments'}
        description={t('description') || 'Manage student enrollments, transfers, and withdrawals across all academic years'}
        actions={
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    This page shows all student enrollments. Use filters to find specific students or view enrollments by academic year and status.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/students">
                <Plus className="h-4 w-4" />
                {t('enrollStudent') || 'Enroll Student'}
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? 'Filtered results' : 'All enrollments'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferred</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.transferred}</div>
            <p className="text-xs text-muted-foreground">
              Moved to other sections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <UserMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.withdrawn}</div>
            <p className="text-xs text-muted-foreground">
              No longer enrolled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Enrollments</CardTitle>
          <CardDescription>Search and filter to find specific enrollment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                {t('searchStudent') || 'Search Student'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchEnrollments') || 'Search by name or registration number...'}
                  className="pl-9 h-11"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-56 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                {t('academicYear') || 'Academic Year'}
              </label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('allYears') || 'All Years'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allAcademicYears') || 'All Academic Years'}</SelectItem>
                  {yearsData?.items?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name} {year.is_current && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                {tc('status') || 'Status'}
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('allStatuses') || 'All Statuses'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses') || 'All Statuses'}</SelectItem>
                  <SelectItem value="active">{t('statusActive') || 'Active'}</SelectItem>
                  <SelectItem value="withdrawn">{t('statusWithdrawn') || 'Withdrawn'}</SelectItem>
                  <SelectItem value="transferred">{t('statusTransferred') || 'Transferred'}</SelectItem>
                  <SelectItem value="graduated">{t('statusGraduated') || 'Graduated'}</SelectItem>
                  <SelectItem value="promoted">{t('statusPromoted') || 'Promoted'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={handleResetFilters}
                className="h-11 px-3 text-muted-foreground hover:text-foreground"
              >
                <FilterX className="h-4 w-4 mr-2" />
                {tc('reset') || 'Reset'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{tc('errorOccurred') || 'An error occurred while loading enrollments'}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <Card>
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
              icon={Users}
              title={t('noEnrollments') || 'No enrollments found'}
              description={
                hasActiveFilters 
                  ? (t('noEnrollmentsForFilters') || 'No enrollments match your current filters. Try adjusting your search criteria.')
                  : 'No student enrollments have been created yet. Start by enrolling students from the Students page.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={handleResetFilters}>
                    {t('clearAllFilters') || 'Clear All Filters'}
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/dashboard/students">
                      <Plus className="h-4 w-4 mr-2" />
                      Go to Students
                    </Link>
                  </Button>
                )
              }
            />
          }
        />
      </Card>

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
        onSubmit={async (data: { remarks?: string }) => {
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

export default function EnrollmentsPageWithAuth() {
  return (
    <ProtectedRoute requireRoles={['admin', 'director', 'registrar']}>
      <EnrollmentsPage />
    </ProtectedRoute>
  );
}

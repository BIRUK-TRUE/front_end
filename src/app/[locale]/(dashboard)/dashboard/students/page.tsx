'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useStudents, useDeleteStudent, useRestoreStudent, useStudentStats } from '@/hooks/use-students';
import type { StudentFilters } from '@/lib/api/students.service';
import { usePermissions } from '@/hooks/use-permissions';
import { useDownloadReportCard } from '@/hooks/use-grades';
import { useCurrentTerm } from '@/hooks/use-academic-years';
import { ActionsDropdown } from '@/components/shared/actions-dropdown';
import { DataTableToolbar } from '@/components/shared/data-table-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { StatsRow } from '@/components/shared/stats-row';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable } from '@/components/shared/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Camera,
  Download,
  Eye,
  FileDown,
  GraduationCap,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react';

type StudentRow = {
  id: string;
  registration_number?: string;
  full_name: string;
  sex?: 'M' | 'F';
  status?: StudentFilters['status'] | 'inactive';
  admission_date?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';
}

function StudentsPage() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const { canManageStudents } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = {
    page,
    size: 20,
    search: search || undefined,
    status: (statusFilter || undefined) as StudentFilters['status'],
    sex: (sexFilter || undefined) as StudentFilters['sex'],
  } satisfies StudentFilters;

  const { data, isLoading, isFetching, error, refetch } = useStudents(filters);
  const { data: studentStats, isLoading: statsLoading } = useStudentStats();
  const deleteStudent = useDeleteStudent();
  const restoreStudent = useRestoreStudent();
  const downloadReportCard = useDownloadReportCard();
  const { data: currentTerm } = useCurrentTerm();
  const students = useMemo<StudentRow[]>(() => data?.items || [], [data?.items]);

  const stats = useMemo(() => {
    // Use actual stats from API, not filtered page data
    const totalStudents = studentStats?.total || 0;
    const activeStudents = studentStats?.active || 0;
    const maleStudents = studentStats?.male || 0;
    const femaleStudents = studentStats?.female || 0;
    const inactiveStudents = totalStudents - activeStudents;
    
    return [
      { title: 'Total', value: totalStudents, icon: GraduationCap, description: 'All students in the system' },
      { title: 'Active', value: activeStudents, icon: UserRoundCheck, description: 'Ready for attendance and grading', trend: { label: 'Available today', tone: 'positive' as const } },
      { title: 'Male', value: maleStudents, icon: Activity, description: 'Male students' },
      { title: 'Female', value: femaleStudents, icon: UserRoundX, description: 'Female students' },
    ];
  }, [studentStats]);

  const columns = useMemo<ColumnDef<StudentRow>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all students"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${row.original.full_name}`}
        />
      ),
    },
    {
      accessorKey: 'full_name',
      header: tc('name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(row.original.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.registration_number}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'registration_number',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.registration_number}</span>,
    },
    {
      accessorKey: 'sex',
      header: t('sex'),
      cell: ({ row }) => <span>{row.original.sex === 'M' ? t('male') : t('female')}</span>,
    },
    {
      accessorKey: 'status',
      header: tc('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status || 'active'} />,
    },
    {
      accessorKey: 'admission_date',
      header: t('admissionDate'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.admission_date ? format(new Date(row.original.admission_date), 'MMM d, yyyy') : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const student = row.original;
        const items = [
          {
            label: tc('view'),
            icon: Eye,
            href: <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-2"><Eye className="h-4 w-4" />{tc('view')}</Link>,
          },
          {
            label: tc('edit'),
            icon: Pencil,
            href: <Link href={`/dashboard/students/${student.id}/edit`} className="flex items-center gap-2"><Pencil className="h-4 w-4" />{tc('edit')}</Link>,
          },
          {
            label: t('faceEnrollment'),
            icon: Camera,
            href: <Link href={`/dashboard/students/${student.id}/face-enrollment`} className="flex items-center gap-2"><Camera className="h-4 w-4" />{t('faceEnrollment')}</Link>,
          },
          ...(currentTerm ? [{
            label: t('downloadReportCard'),
            icon: FileDown,
            onSelect: () => downloadReportCard.mutate({ studentId: student.id, termId: currentTerm.id }),
            disabled: downloadReportCard.isPending,
          }] : []),
          ...(student.status === 'inactive' ? [{
            label: tc('restore'),
            icon: RotateCcw,
            onSelect: () => restoreStudent.mutate(student.id),
          }] : []),
          {
            label: tc('delete'),
            icon: Trash2,
            destructive: true,
            onSelect: () => setDeleteId(student.id),
          },
        ];
        return <ActionsDropdown items={items} label={`${tc('actions')} for ${student.full_name}`} />;
      },
    },
  ], [t, tc, currentTerm, downloadReportCard, restoreStudent]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        icon={GraduationCap}
        breadcrumb={['Admin', 'People', 'Students']}
        action={canManageStudents ? (
          <Link href="/dashboard/students/create">
            <Button className="min-h-11 gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('createStudent')}
            </Button>
          </Link>
        ) : undefined}
      />

      <StatsRow items={stats} isLoading={statsLoading} />

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder={t('searchStudents')}
      >
        <Select value={statusFilter || 'all'} onValueChange={(value) => { setStatusFilter(value === 'all' ? '' : value); setPage(1); }}>
          <SelectTrigger className="h-11 w-full sm:w-[160px]"><SelectValue placeholder={tc('status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tc('all')}</SelectItem>
            {['active', 'graduated', 'transferred', 'expelled', 'withdrawn'].map((status) => (
              <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sexFilter || 'all'} onValueChange={(value) => { setSexFilter(value === 'all' ? '' : value); setPage(1); }}>
          <SelectTrigger className="h-11 w-full sm:w-[140px]"><SelectValue placeholder={t('sex')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tc('all')}</SelectItem>
            <SelectItem value="M">{t('male')}</SelectItem>
            <SelectItem value="F">{t('female')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-11 gap-2">
          <Download className="h-4 w-4" aria-hidden="true" />
          Export
        </Button>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading || isFetching}
        manualPagination
        pageCount={data?.pages || 1}
        pagination={{ pageIndex: page - 1, pageSize: 20 }}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function'
            ? updater({ pageIndex: page - 1, pageSize: 20 })
            : updater;
          setPage(next.pageIndex + 1);
        }}
        emptyState={
          !isLoading && !isFetching && !error && (!data || data.items.length === 0) ? (
            <EmptyState icon={GraduationCap} title={t('noStudents')} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20 mb-4">
                <GraduationCap className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load students</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {(error as any)?.response?.data?.message || (error as any).message || 'There was an error loading the students list. Please try again.'}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteStudent.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        isLoading={deleteStudent.isPending}
      />
    </div>
  );
}

export default function StudentsPageWithAuth() {
  return (
    <ProtectedRoute requireRoles={['admin', 'director', 'registrar']}>
      <StudentsPage />
    </ProtectedRoute>
  );
}

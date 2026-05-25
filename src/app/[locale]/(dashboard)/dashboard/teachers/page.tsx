'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useTeachers, useDeleteTeacher, useRestoreTeacher, useTeacherStats } from '@/hooks/use-teachers';
import type { TeacherFilters } from '@/lib/api/teachers.service';
import { usePermissions } from '@/hooks/use-permissions';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, BookOpen, Download, Eye, Pencil, Plus, RotateCcw, Trash2, UserRoundCheck, UserRoundX } from 'lucide-react';

type TeacherRow = {
  id: string;
  employee_id?: string | null;
  full_name: string;
  specialization?: string | null;
  status?: TeacherFilters['status'];
  hire_date?: string | null;
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'TC';
}

export default function TeachersPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const { canManageTeachers } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = { page, size: 20, search: search || undefined, status: (statusFilter || undefined) as TeacherFilters['status'] } satisfies TeacherFilters;
  const { data, isLoading } = useTeachers(filters);
  const { data: teacherStats, isLoading: statsLoading } = useTeacherStats();
  const deleteTeacher = useDeleteTeacher();
  const restoreTeacher = useRestoreTeacher();
  const teachers = useMemo<TeacherRow[]>(() => data?.items || [], [data?.items]);

  const stats = useMemo(() => {
    // Use actual stats from API, not filtered page data
    const totalTeachers = teacherStats?.total || 0;
    const activeTeachers = teacherStats?.active || 0;
    const onLeaveTeachers = teacherStats?.on_leave || 0;
    const inactiveTeachers = totalTeachers - activeTeachers;
    
    return [
      { title: 'Total', value: totalTeachers, icon: BookOpen, description: 'All teachers in the system' },
      { title: 'Active', value: activeTeachers, icon: UserRoundCheck, description: 'Available for classes', trend: { label: 'Teaching roster', tone: 'positive' as const } },
      { title: 'On Leave', value: onLeaveTeachers, icon: UserRoundX, description: 'Temporarily unavailable' },
      { title: 'Inactive', value: inactiveTeachers, icon: Activity, description: 'Resigned, retired, or suspended' },
    ];
  }, [teacherStats]);

  const columns: ColumnDef<TeacherRow>[] = [
    {
      id: 'select',
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all teachers" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={`Select ${row.original.full_name}`} />,
    },
    {
      accessorKey: 'full_name',
      header: tc('name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(row.original.full_name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.employee_id || '-'}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'employee_id', header: 'ID', cell: ({ row }) => <span className="font-mono text-sm">{row.original.employee_id || '-'}</span> },
    { accessorKey: 'specialization', header: t('specialization'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.specialization || '-'}</span> },
    { accessorKey: 'status', header: tc('status'), cell: ({ row }) => <StatusBadge status={row.original.status || 'active'} /> },
    {
      accessorKey: 'hire_date',
      header: t('hireDate'),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.hire_date ? format(new Date(row.original.hire_date), 'MMM d, yyyy') : '-'}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <ActionsDropdown
            label={`${tc('actions')} for ${teacher.full_name}`}
            items={[
              { label: tc('view'), icon: Eye, href: <Link href={`/dashboard/teachers/${teacher.id}`} className="flex items-center gap-2"><Eye className="h-4 w-4" />{tc('view')}</Link> },
              { label: tc('edit'), icon: Pencil, href: <Link href={`/dashboard/teachers/${teacher.id}/edit`} className="flex items-center gap-2"><Pencil className="h-4 w-4" />{tc('edit')}</Link> },
              ...(teacher.status !== 'active' ? [{ label: tc('restore'), icon: RotateCcw, onSelect: () => restoreTeacher.mutate(teacher.id) }] : []),
              { label: tc('delete'), icon: Trash2, destructive: true, onSelect: () => setDeleteId(teacher.id) },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        icon={BookOpen}
        breadcrumb={['Admin', 'People', 'Teachers']}
        action={canManageTeachers ? (
          <Link href="/dashboard/teachers/create">
            <Button className="min-h-11 gap-2"><Plus className="h-4 w-4" aria-hidden="true" />{t('createTeacher')}</Button>
          </Link>
        ) : undefined}
      />

      <StatsRow items={stats} isLoading={statsLoading} />

      <DataTableToolbar search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchPlaceholder={t('searchTeachers')}>
        <Select value={statusFilter || 'all'} onValueChange={(value) => { setStatusFilter(value === 'all' ? '' : value); setPage(1); }}>
          <SelectTrigger className="h-11 w-full sm:w-[170px]"><SelectValue placeholder={tc('status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tc('all')}</SelectItem>
            {['active', 'on_leave', 'suspended', 'resigned', 'retired'].map((status) => (
              <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-11 gap-2"><Download className="h-4 w-4" aria-hidden="true" />Export</Button>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={teachers}
        isLoading={isLoading}
        manualPagination
        pageCount={data?.pages || 1}
        pagination={{ pageIndex: page - 1, pageSize: 20 }}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: 20 }) : updater;
          setPage(next.pageIndex + 1);
        }}
        emptyState={<EmptyState icon={BookOpen} title={t('noTeachers')} />}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteTeacher.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        isLoading={deleteTeacher.isPending}
      />
    </div>
  );
}

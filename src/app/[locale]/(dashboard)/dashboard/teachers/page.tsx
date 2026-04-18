'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useTeachers, useDeleteTeacher, useRestoreTeacher } from '@/hooks/use-teachers';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function TeachersPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const { canManageTeachers } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = { page, size: 20, search: search || undefined, status: (statusFilter || undefined) as any };
  const { data, isLoading } = useTeachers(filters);
  const deleteTeacher = useDeleteTeacher();
  const restoreTeacher = useRestoreTeacher();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'employee_id',
      header: t('employeeId'),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.employee_id || '—'}</span>,
    },
    {
      accessorKey: 'full_name',
      header: tc('name'),
      cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
    },
    {
      accessorKey: 'specialization',
      header: t('specialization'),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.specialization || '—'}</span>,
    },
    {
      accessorKey: 'status',
      header: tc('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status || 'active'} />,
    },
    {
      accessorKey: 'hire_date',
      header: t('hireDate'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.hire_date ? format(new Date(row.original.hire_date), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label={`${tc('actions')} for ${teacher.full_name}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teachers/${teacher.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />{tc('view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teachers/${teacher.id}/edit`} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />{tc('edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(teacher.id)} className="text-destructive focus:text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />{tc('delete')}
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
        actions={canManageTeachers ? (
          <Link href="/dashboard/teachers/create">
            <Button className="gap-2 min-h-[44px]"><Plus className="h-4 w-4" aria-hidden="true" />{t('createTeacher')}</Button>
          </Link>
        ) : undefined}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input placeholder={t('searchTeachers')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-11" aria-label={tc('search')} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-11"><SelectValue placeholder={tc('status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {['active', 'on_leave', 'suspended', 'resigned', 'retired'].map((s) => (
                  <SelectItem key={s} value={s}>{t(`status${s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        manualPagination
        pageCount={data?.pages || 1}
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
            icon={BookOpen}
            title={t('noTeachers')}
            action={canManageTeachers ? (
              <Link href="/dashboard/teachers/create">
                <Button className="gap-2"><Plus className="h-4 w-4" />{t('createTeacher')}</Button>
              </Link>
            ) : undefined}
          />
        }
      />
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={() => { if(deleteId) deleteTeacher.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} isLoading={deleteTeacher.isPending} />
    </div>
  );
}

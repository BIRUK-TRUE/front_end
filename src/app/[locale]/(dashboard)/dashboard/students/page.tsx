'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useStudents, useDeleteStudent, useRestoreStudent } from '@/hooks/use-students';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentsPage() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const { canManageStudents } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = {
    page, size: 20,
    search: search || undefined,
    status: (statusFilter || undefined) as any,
    sex: (sexFilter || undefined) as any,
  };

  const { data, isLoading } = useStudents(filters);
  const deleteStudent = useDeleteStudent();
  const restoreStudent = useRestoreStudent();

  const handleDelete = () => {
    if (deleteId) {
      deleteStudent.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'registration_number',
      header: t('registrationNumber'),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.registration_number}</span>,
    },
    {
      accessorKey: 'full_name',
      header: tc('name'),
      cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
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
          {row.original.admission_date ? format(new Date(row.original.admission_date), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" aria-hidden="true" />{tc('view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/students/${student.id}/edit`} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" aria-hidden="true" />{tc('edit')}
                </Link>
              </DropdownMenuItem>
              {student.status === 'inactive' && (
                <DropdownMenuItem onClick={() => restoreStudent.mutate(student.id)} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />{tc('restore')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setDeleteId(student.id)} className="text-destructive focus:text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" aria-hidden="true" />{tc('delete')}
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
        actions={
          canManageStudents ? (
            <Link href="/dashboard/students/create">
              <Button className="gap-2 min-h-[44px]">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('createStudent')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('searchStudents')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-11"
                aria-label={tc('search')}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-11">
                <SelectValue placeholder={tc('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {['active', 'graduated', 'transferred', 'expelled', 'withdrawn'].map((s) => (
                  <SelectItem key={s} value={s}>{t(`status${s.charAt(0).toUpperCase() + s.slice(1)}` as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sexFilter} onValueChange={(v) => { setSexFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[120px] h-11">
                <SelectValue placeholder={t('sex')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                <SelectItem value="M">{t('male')}</SelectItem>
                <SelectItem value="F">{t('female')}</SelectItem>
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
            icon={GraduationCap}
            title={t('noStudents')}
            action={canManageStudents ? (
              <Link href="/dashboard/students/create">
                <Button className="gap-2"><Plus className="h-4 w-4" aria-hidden="true" />{t('createStudent')}</Button>
              </Link>
            ) : undefined}
          />
        }
      />

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} onConfirm={handleDelete} isLoading={deleteStudent.isPending} />
    </div>
  );
}

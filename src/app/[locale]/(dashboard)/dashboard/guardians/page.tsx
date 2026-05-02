'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGuardians, useDeleteGuardian } from '@/hooks/use-guardians';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, UserCheck } from 'lucide-react';

export default function GuardiansPage() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const { canManageGuardians } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = { page, size: 20, search: search || undefined, is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined };
  const { data, isLoading } = useGuardians(filters);
  const deleteGuardian = useDeleteGuardian();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'full_name',
      header: tc('name'),
      cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
    },
    {
      accessorKey: 'email',
      header: tc('email'),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: 'phone_number',
      header: tc('phone'),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone_number || '—'}</span>,
    },
    {
      accessorKey: 'occupation',
      header: t('occupation'),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.occupation || '—'}</span>,
    },
    {
      accessorKey: 'student_links',
      header: t('linkedStudents'),
      cell: ({ row }) => <span>{row.original.student_links?.length || 0}</span>,
    },
    {
      accessorKey: 'is_active',
      header: tc('status'),
      cell: ({ row }) => (
        <span className={row.original.is_active ? 'text-green-600' : 'text-muted-foreground'}>
          {row.original.is_active ? tc('active') : tc('inactive')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const guardian = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/guardians/${guardian.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />{tc('view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/guardians/${guardian.id}/edit`} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />{tc('edit')}
                </Link>
              </DropdownMenuItem>
              {guardian.is_active && (
                <DropdownMenuItem onClick={() => setDeleteId(guardian.id)} className="text-destructive focus:text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />{tc('delete')}
                </DropdownMenuItem>
              )}
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
        actions={canManageGuardians ? (
          <Link href="/dashboard/guardians/create">
            <Button className="gap-2 min-h-[44px]"><Plus className="h-4 w-4" />{t('createGuardian')}</Button>
          </Link>
        ) : undefined}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('searchGuardians')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-11" aria-label={tc('search')} />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full h-9"
                onClick={() => setStatusFilter('all')}
              >
                {tc('all')}
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full h-9"
                onClick={() => setStatusFilter('active')}
              >
                {tc('active')}
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full h-9"
                onClick={() => setStatusFilter('inactive')}
              >
                {tc('inactive')}
              </Button>
            </div>
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
            icon={UserCheck}
            title={t('noGuardians')}
            action={canManageGuardians ? (
              <Link href="/dashboard/guardians/create">
                <Button className="gap-2"><Plus className="h-4 w-4" />{t('createGuardian')}</Button>
              </Link>
            ) : undefined}
          />
        }
      />
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={() => { if(deleteId) deleteGuardian.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} isLoading={deleteGuardian.isPending} />
    </div>
  );
}

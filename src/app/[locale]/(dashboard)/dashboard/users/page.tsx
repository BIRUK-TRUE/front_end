'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useUsers } from '@/hooks/use-users';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge, RoleBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDeleteUser, useRestoreUser } from '@/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function UsersPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const { canCreateUser, canRestoreUser } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = {
    page,
    size: 20,
    search: search || undefined,
    role: roleFilter || undefined,
    is_active: activeFilter === '' ? undefined : activeFilter === 'true',
  };

  const { data, isLoading, error } = useUsers(filters);
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();

  const handleDelete = () => {
    if (deleteId) {
      deleteUser.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

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
      id: 'roles',
      header: tr('admin').split(' ')[0] + 's',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.roles || []).map((role: any) => (
            <RoleBadge
              key={typeof role === 'string' ? role : role.name}
              role={typeof role === 'string' ? role : role.name}
            />
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: tc('status'),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.is_active ? 'active' : 'inactive'}
          label={row.original.is_active ? tc('active') : tc('inactive')}
        />
      ),
    },
    {
      accessorKey: 'created_at',
      header: tc('createdAt'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.created_at
            ? format(new Date(row.original.created_at), 'MMM d, yyyy')
            : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                aria-label={`${tc('actions')} for ${user.full_name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {tc('view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}/edit`} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {tc('edit')}
                </Link>
              </DropdownMenuItem>
              {!user.is_active && canRestoreUser && (
                <DropdownMenuItem
                  onClick={() => restoreUser.mutate(user.id)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {tc('restore')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setDeleteId(user.id)}
                className="text-destructive focus:text-destructive flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {tc('delete')}
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
          canCreateUser ? (
            <Link href="/dashboard/users/create">
              <Button className="gap-2 min-h-[44px]">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('createUser')}
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
                placeholder={t('searchUsers')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-11"
                aria-label={tc('search')}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-11">
                <SelectValue placeholder={tc('filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {['admin', 'director', 'registrar', 'teacher', 'student', 'guardian'].map(
                  (role) => (
                    <SelectItem key={role} value={role}>
                      {tr(role as any)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={activeFilter}
              onValueChange={(v) => {
                setActiveFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px] h-11">
                <SelectValue placeholder={tc('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                <SelectItem value="true">{tc('active')}</SelectItem>
                <SelectItem value="false">{tc('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
            icon={Users}
            title={t('noUsers')}
            action={
              canCreateUser ? (
                <Link href="/dashboard/users/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('createUser')}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        }
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}

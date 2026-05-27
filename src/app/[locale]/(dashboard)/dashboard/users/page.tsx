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
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, Users, Bug } from 'lucide-react';
import { format } from 'date-fns';
import { ProtectedRoute } from '@/components/auth/protected-route';

function UsersPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const { canCreateUser, canRestoreUser } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'deleted'
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = {
    page,
    size: 20,
    search: search || undefined,
    role_name: roleFilter || undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    include_deleted: statusFilter === 'deleted' ? true : undefined,
  };

  const { data, isLoading, error, isFetching, refetch } = useUsers(filters);
  
  console.log('🔍 [Users Page] Component render');
  console.log('🔍 [Users Page] isLoading:', isLoading);
  console.log('🔍 [Users Page] isFetching:', isFetching);
  console.log('🔍 [Users Page] error:', error);
  console.log('🔍 [Users Page] data:', data);
  console.log('🔍 [Users Page] data?.items:', data?.items);
  console.log('🔍 [Users Page] data?.items?.length:', data?.items?.length);
  console.log('🔍 [Users Page] Should show empty?', !isLoading && !isFetching && (!data || data.items.length === 0));

  // Enhanced error logging
  if (error) {
    console.error('❌ [Users Page] Query error:', error);
    console.error('❌ [Users Page] Error details:', {
      message: error.message,
      response: (error as any)?.response?.data,
      status: (error as any)?.response?.status,
    });
  }
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
      header: t('roles'),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.roles || []).map((role: string | { name: string }) => (
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
      cell: ({ row }) => {
        const user = row.original;
        const isDeleted = !!user.deleted_at;
        const status = isDeleted ? 'deleted' : user.is_active ? 'active' : 'inactive';
        const label = isDeleted ? 'Deleted' : user.is_active ? tc('active') : tc('inactive');
        return (
          <StatusBadge
            status={status}
            label={label}
          />
        );
      },
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
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-11">
                <SelectValue placeholder={tc('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                <SelectItem value="active">{tc('active')}</SelectItem>
                <SelectItem value="inactive">{tc('inactive')}</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading || isFetching}
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
          !isLoading && !isFetching && !error && (!data || data.items.length === 0) ? (
            <EmptyState
              icon={Users}
              title={t('noUsers')}
              description="There are no users matching your criteria."
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
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20 mb-4">
                <Users className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load users</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {(error as any)?.response?.data?.message || error.message || 'There was an error loading the users list. Please try again.'}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Link href="/dashboard/debug">
                  <Button variant="outline" className="gap-2">
                    <Bug className="h-4 w-4" />
                    Debug
                  </Button>
                </Link>
              </div>
            </div>
          ) : undefined
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

export default function UsersPageWithAuth() {
  return (
    <ProtectedRoute requireRoles={['admin', 'director', 'registrar']}>
      <UsersPage />
    </ProtectedRoute>
  );
}

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner text={tc('loading')} />
            </div>
          ) : !data?.items?.length ? (
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
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tc('name')}</TableHead>
                      <TableHead>{tc('email')}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {tr('admin').split(' ')[0]}s
                      </TableHead>
                      <TableHead>{tc('status')}</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {tc('createdAt')}
                      </TableHead>
                      <TableHead className="w-[60px]">
                        <span className="sr-only">{tc('actions')}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(user.roles || []).map((role: any) => (
                              <RoleBadge
                                key={typeof role === 'string' ? role : role.name}
                                role={typeof role === 'string' ? role : role.name}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={user.is_active ? 'active' : 'inactive'}
                            label={user.is_active ? tc('active') : tc('inactive')}
                          />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {user.created_at
                            ? format(new Date(user.created_at), 'MMM d, yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    {tc('showing')} {(data.page - 1) * data.size + 1}–
                    {Math.min(data.page * data.size, data.total)} {tc('of')}{' '}
                    {data.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="min-h-[44px]"
                    >
                      {tc('previous')}
                    </Button>
                    <span className="text-sm">
                      {tc('page')} {data.page} {tc('of')} {data.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pages}
                      className="min-h-[44px]"
                    >
                      {tc('next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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

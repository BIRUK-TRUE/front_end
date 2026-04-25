'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useUsers, useDeleteUser, useRestoreUser } from '@/hooks/use-users';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { MoreHorizontal, Plus, Search, Pencil, UserX, UserCheck, Eye } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DirectorsPage() {
  const t = useTranslations('users');
  const tr = useTranslations('roles');
  const tc = useTranslations('common');
  const td = useTranslations('directorsPage');
  const router = useRouter();
  const { canViewUsers: canManageUsers } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Directors are users with the 'director' role
  const { data, isLoading } = useUsers({
    page,
    size: 20,
    search: search || undefined,
    role: 'director',
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  });

  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteUser.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tr('director') + 's'}
        description={td('description')}
        actions={
          canManageUsers && (
            <Link href="/dashboard/users/create">
              <Button className="gap-2 min-h-[44px]">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('createUser')}
              </Button>
            </Link>
          )
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('searchUsers')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
              />
            </form>
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

          <div className="relative overflow-x-auto">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : !data?.items?.length ? (
              <EmptyState
                icon={Search}
                title={tc('noResults')}
                description={td('noResultsDescription')}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">{tc('name')}</TableHead>
                    <TableHead>{tc('email')}</TableHead>
                    <TableHead>{tc('phone')}</TableHead>
                    <TableHead>{tc('status')}</TableHead>
                    <TableHead className="text-right">{tc('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage src={user.profile_image_url} alt={user.full_name} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs">
                              {user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate max-w-[180px]">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">{user.phone_number || '—'}</TableCell>
                      <TableCell>
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} label={user.is_active ? tc('active') : tc('inactive')} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-full" aria-label={td('openMenu')}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>{tc('actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.id}`)} className="gap-2 cursor-pointer">
                              <Eye className="h-4 w-4" aria-hidden="true" />
                              {tc('view')}
                            </DropdownMenuItem>
                            {canManageUsers && (
                              <>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.id}/edit`)} className="gap-2 cursor-pointer">
                                  <Pencil className="h-4 w-4" aria-hidden="true" />
                                  {tc('edit')}
                                </DropdownMenuItem>
                                {user.is_active ? (
                                  <DropdownMenuItem
                                    onClick={() => setDeleteId(user.id)}
                                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                  >
                                    <UserX className="h-4 w-4" aria-hidden="true" />
                                    {tc('delete')}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      await restoreUser.mutateAsync(user.id);
                                    }}
                                    className="gap-2 text-primary focus:text-primary cursor-pointer"
                                  >
                                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                                    {tc('restore')}
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        title={tc('confirmDelete')}
        description={tc('confirmDeleteDescription')}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}

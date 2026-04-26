'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useUser } from '@/hooks/use-users';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/lib/store/auth-store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge, RoleBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Trash2, RotateCcw, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useDeleteUser, useRestoreUser } from '@/hooks/use-users';

function UserDetailPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const { canEditUser, canDeleteUser, canRestoreUser } = usePermissions();
  const { user: currentUser } = useAuthStore();
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const userRoles = (user?.roles || []).map((r: any) => typeof r === 'string' ? r : r.name);
  const canEdit = canEditUser(userRoles);
  const canDelete = canDeleteUser(userRoles);
  const isOwnProfile = currentUser?.id === id;

  const handleDelete = () => {
    if (deleteId) {
      deleteUser.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!user) return null;

  const initials = user.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard/users" className="hover:text-foreground">
          {t('title')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{user.full_name}</span>
      </nav>

      <PageHeader
        title={t('userDetails')}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/users">
              <Button variant="outline" className="gap-2 min-h-[44px]">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {tc('back')}
              </Button>
            </Link>
            {canEdit && !isOwnProfile && (
              <Link href={`/dashboard/users/${id}/edit`}>
                <Button className="gap-2 min-h-[44px]">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {tc('edit')}
                </Button>
              </Link>
            )}
            {!user.is_active && canRestoreUser && (
              <Button
                variant="outline"
                onClick={() => restoreUser.mutate(id)}
                className="gap-2 min-h-[44px]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {tc('restore')}
              </Button>
            )}
            {canDelete && !isOwnProfile && user.is_active && (
              <Button
                variant="destructive"
                onClick={() => setDeleteId(id)}
                className="gap-2 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {tc('delete')}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <div className="mt-3">
              <StatusBadge
                status={user.is_active ? 'active' : 'inactive'}
                label={user.is_active ? tc('active') : tc('inactive')}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {(user.roles || []).map((role: any) => (
                <RoleBadge
                  key={typeof role === 'string' ? role : role.name}
                  role={typeof role === 'string' ? role : role.name}
                  label={tr((typeof role === 'string' ? role : role.name) as any)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{tc('details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label={tc('email')} value={user.email} />
              <InfoRow icon={Phone} label={tc('phone')} value={user.phone_number || '—'} />
              <InfoRow icon={MapPin} label={tc('address')} value={user.address || '—'} />
              <InfoRow
                icon={Calendar}
                label={tc('createdAt')}
                value={
                  user.created_at
                    ? format(new Date(user.created_at), 'MMM d, yyyy')
                    : '—'
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

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

export default function UserDetailPageWrapper() {
  return <ProtectedRoute><UserDetailPage /></ProtectedRoute>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

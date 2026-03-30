'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { PageHeader } from '@/components/shared/page-header';
import { RoleBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';
import { Mail, Phone, MapPin, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const { user } = useAuthStore();

  if (!user) return null;

  const initials = user.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={tc('profile')} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {user.roles.map((role) => (
                <RoleBadge key={role} role={role} label={tr(role as any)} />
              ))}
            </div>
            <Link href="/change-password">
              <Button variant="outline" className="mt-5 gap-2 min-h-[44px] w-full">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Change Password
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{tc('details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label={tc('email')} value={user.email} />
              <InfoRow icon={Phone} label={tc('phone')} value={user.phone_number || '—'} />
              <InfoRow icon={MapPin} label={tc('address')} value={user.address || '—'} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
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

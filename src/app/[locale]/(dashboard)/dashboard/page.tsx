'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePermissions } from '@/hooks/use-permissions';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { EnrollmentChart } from '@/components/shared/enrollment-chart-lazy';
import { ActivityFeed } from '@/components/shared/activity-feed';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { user } = useAuthStore();
  const { canViewUsers, canManageStudents, canManageTeachers, canManageGuardians } =
    usePermissions();

  const { data: stats, isPending, isError } = useDashboardStats();

  const loading = isPending;
  const desc = (text: string) => (loading ? tc('loading') : isError ? '—' : text);

  const isStaff = canViewUsers;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${t('welcomeBack')}, ${user?.full_name?.split(' ')[0] || ''}`}
        description={t('hereIsOverview')}
      />

      {isStaff && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canViewUsers && (
            <StatsCard
              title={t('totalUsers')}
              value={stats?.users.total?.toString() || '0'}
              icon={Users}
              description={desc(`${stats?.users.active || 0} ${t('activeUsers')}`)}
              trend={
                stats?.users.growth !== undefined
                  ? { value: stats.users.growth, positive: stats.users.growth >= 0 }
                  : undefined
              }
            />
          )}
          {canManageStudents && (
            <StatsCard
              title={t('activeStudents')}
              value={stats?.students.active?.toString() || '0'}
              icon={GraduationCap}
              description={desc(`${t('total')}: ${stats?.students.total || 0}`)}
              trend={
                stats?.students.growth !== undefined
                  ? { value: stats.students.growth, positive: stats.students.growth >= 0 }
                  : undefined
              }
            />
          )}
          {canManageTeachers && (
            <StatsCard
              title={t('activeTeachers')}
              value={stats?.teachers.active?.toString() || '0'}
              icon={BookOpen}
              description={desc(`${t('total')}: ${stats?.teachers.total || 0}`)}
              trend={
                stats?.teachers.growth !== undefined
                  ? { value: stats.teachers.growth, positive: stats.teachers.growth >= 0 }
                  : undefined
              }
            />
          )}
          {canManageGuardians && (
            <StatsCard
              title={t('totalGuardians')}
              value={stats?.guardians.total?.toString() || '0'}
              icon={UserCheck}
              description={desc(`${stats?.guardians.active || 0} ${t('verified')}`)}
            />
          )}
        </div>
      )}

      {isStaff && (
        <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <EnrollmentChart />
          <ActivityFeed />
        </div>
      )}

      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {canViewUsers && (
                <Link href="/dashboard/users/create">
                  <Button variant="outline" className="gap-2 min-h-[44px]">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('addUser')}
                  </Button>
                </Link>
              )}
              {canManageStudents && (
                <Link href="/dashboard/students/create">
                  <Button variant="outline" className="gap-2 min-h-[44px]">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('addStudent')}
                  </Button>
                </Link>
              )}
              {canManageTeachers && (
                <Link href="/dashboard/teachers/create">
                  <Button variant="outline" className="gap-2 min-h-[44px]">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('addTeacher')}
                  </Button>
                </Link>
              )}
              {canManageGuardians && (
                <Link href="/dashboard/guardians/create">
                  <Button variant="outline" className="gap-2 min-h-[44px]">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('addGuardian')}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isStaff && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold">{tc('welcome')}</h2>
            <p className="mt-2 text-muted-foreground">{t('hereIsOverview')}</p>
            <Link href="/dashboard/profile">
              <Button className="mt-4 gap-2 min-h-[44px]">
                {tc('profile')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

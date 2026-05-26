'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePermissions } from '@/hooks/use-permissions';
import { useUserStats } from '@/hooks/use-users';
import { useStudentStats } from '@/hooks/use-students';
import { useTeacherStats } from '@/hooks/use-teachers';
import { useGuardianStats } from '@/hooks/use-guardians';
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

  const { data: userStats, isPending: userLoading, isError: userError } = useUserStats();
  const { data: studentStats, isPending: studentLoading, isError: studentError } =
    useStudentStats();
  const { data: teacherStats, isPending: teacherLoading, isError: teacherError } =
    useTeacherStats();
  const { data: guardianStats, isPending: guardianLoading, isError: guardianError } =
    useGuardianStats();

  const statDescription = (
    loading: boolean,
    error: boolean,
    text: string
  ) => (loading ? tc('loading') : error ? '—' : text);

  const isStaff = canViewUsers;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={`${t('welcomeBack')}, ${user?.full_name?.split(' ')[0] || ''}`}
        description={t('hereIsOverview')}
      />

      {/* Stats Grid — role-based */}
      {isStaff && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canViewUsers && (
            <StatsCard
              title={t('totalUsers')}
              value={userStats?.total?.toString() || '0'}
              icon={Users}
              description={statDescription(
                userLoading,
                userError,
                `${userStats?.active || 0} ${t('activeUsers')}`
              )}
              trend={userStats?.growth !== undefined ? { value: userStats.growth, positive: userStats.growth >= 0 } : undefined}
            />
          )}
          {canManageStudents && (
            <StatsCard
              title={t('activeStudents')}
              value={studentStats?.active?.toString() || '0'}
              icon={GraduationCap}
              description={statDescription(
                studentLoading,
                studentError,
                `${t('total')}: ${studentStats?.total || 0}`
              )}
              trend={studentStats?.growth !== undefined ? { value: studentStats.growth, positive: studentStats.growth >= 0 } : undefined}
            />
          )}
          {canManageTeachers && (
            <StatsCard
              title={t('activeTeachers')}
              value={teacherStats?.active?.toString() || '0'}
              icon={BookOpen}
              description={statDescription(
                teacherLoading,
                teacherError,
                `${t('total')}: ${teacherStats?.total || 0}`
              )}
              trend={teacherStats?.growth !== undefined ? { value: teacherStats.growth, positive: teacherStats.growth >= 0 } : undefined}
            />
          )}
          {canManageGuardians && (
            <StatsCard
              title={t('totalGuardians')}
              value={guardianStats?.total?.toString() || '0'}
              icon={UserCheck}
              description={statDescription(
                guardianLoading,
                guardianError,
                `${guardianStats?.active || 0} ${t('verified')}`
              )}
            />
          )}
        </div>
      )}

      {/* Analytics & Charts */}
      {isStaff && (
        <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <EnrollmentChart />
          <ActivityFeed />
        </div>
      )}

      {/* Quick Actions */}
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

      {/* Non-staff welcome card */}
      {!isStaff && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold">{tc('welcome')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('hereIsOverview')}
            </p>
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

'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUnreadNotifications } from '@/features/notifications/api/useNotifications';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  User,
  Settings,
  ChevronLeft,
  X,
  Building2,
  History,
  ClipboardCheck,
  Award,
  CalendarClock,
  School,
  CalendarCheck,
  Clock,
  Wallet,
  Bell,
  BarChart3,
  TrendingUp,
  ScanFace,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  show: boolean;
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
}: SidebarProps) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const {
    canViewUsers,
    canManageStudents,
    canManageTeachers,
    canManageGuardians,
    canAccessSettings,
    canManageAcademics,
    canManageEnrollments,
    canViewOwnClasses,
    canTakeAttendance,
    canEnterGrades,
    canViewOwnSchedule,
    canViewAnalytics,
    canViewTeacherAnalytics,
    canManageNotifications,
    isTeacher,
    isStudent,
    isGuardian,
  } = usePermissions();
  
  const { user } = useAuthStore();
  const { data: unreadCount } = useUnreadNotifications(user?.id || '');

  // Teacher-specific nav items (shown only to teachers)
  const teacherNavItems: NavItem[] = [
    {
      href: '/dashboard/teacher',
      label: t('dashboard'),
      icon: LayoutDashboard,
      show: isTeacher,
    },
    {
      href: '/dashboard/teacher/my-classes',
      label: t('myClasses'),
      icon: School,
      show: canViewOwnClasses,
    },
    {
      href: '/dashboard/teacher/attendance',
      label: t('attendance'),
      icon: ClipboardCheck,
      show: canTakeAttendance,
    },
    {
      href: '/dashboard/attendance/face-scan',
      label: t('faceScan'),
      icon: ScanFace,
      show: canTakeAttendance,
    },
    {
      href: '/dashboard/teacher/grades',
      label: t('grades'),
      icon: Award,
      show: canEnterGrades,
    },
    {
      href: '/dashboard/teacher/schedule',
      label: t('mySchedule'),
      icon: CalendarClock,
      show: canViewOwnSchedule,
    },
    {
      href: '/dashboard/teacher/analytics',
      label: t('myClassAnalytics'),
      icon: TrendingUp,
      show: canViewTeacherAnalytics,
    },
  ];

  // Student-specific nav items (shown only to students)
  const studentNavItems: NavItem[] = [
    {
      href: '/dashboard/student',
      label: t('dashboard'),
      icon: LayoutDashboard,
      show: isStudent,
    },
    {
      href: '/dashboard/student/my-attendance',
      label: t('myAttendance'),
      icon: CalendarCheck,
      show: isStudent,
    },
    {
      href: '/dashboard/student/my-grades',
      label: t('myGrades'),
      icon: BookOpen,
      show: isStudent,
    },
    {
      href: '/dashboard/student/my-schedule',
      label: t('mySchedule'),
      icon: Clock,
      show: isStudent,
    },
    {
      href: '/dashboard/student/my-profile',
      label: t('myProfile'),
      icon: User,
      show: isStudent,
    },
  ];

  // Guardian-specific nav items (shown only to guardians)
  const guardianNavItems: NavItem[] = [
    {
      href: '/dashboard/guardian',
      label: t('dashboard'),
      icon: LayoutDashboard,
      show: isGuardian,
    },
    {
      href: '/dashboard/guardian',
      label: t('myChildren'),
      icon: Users,
      show: isGuardian,
    },
    {
      href: '/dashboard/guardian/notifications',
      label: t('notifications'),
      icon: Bell,
      show: isGuardian,
    },
    {
      href: '/dashboard/guardian/payments',
      label: t('payments'),
      icon: Wallet,
      show: isGuardian,
    },
    {
      href: '/dashboard/guardian/profile',
      label: t('settings'),
      icon: Settings,
      show: isGuardian,
    },
  ];

  // Admin/Registrar/Director nav items
  const adminNavItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      show: !isTeacher, // Hide from teachers who use /dashboard/teacher
    },
    {
      href: '/dashboard/analytics',
      label: t('analytics'),
      icon: BarChart3,
      show: canViewAnalytics,
    },
    {
      href: '/dashboard/users',
      label: t('users'),
      icon: Users,
      show: canViewUsers,
    },
    {
      href: '/dashboard/directors',
      label: t('directors'),
      icon: UserCheck,
      show: canViewUsers,
    },
    {
      href: '/dashboard/students',
      label: t('students'),
      icon: GraduationCap,
      show: canManageStudents,
    },
    {
      href: '/dashboard/academics/subjects',
      label: t('academics'),
      icon: Building2,
      show: canManageAcademics,
    },
    {
      href: '/dashboard/enrollments',
      label: t('enrollments'),
      icon: History,
      show: canManageEnrollments,
    },
    {
      href: '/dashboard/schedule',
      label: t('schedule'),
      icon: CalendarClock,
      show: (canManageStudents || canManageAcademics) && !isTeacher,
    },
    {
      href: '/dashboard/teachers',
      label: t('teachers'),
      icon: BookOpen,
      show: canManageTeachers,
    },
    {
      href: '/dashboard/guardians',
      label: t('guardians'),
      icon: UserCheck,
      show: canManageGuardians,
    },
    {
      href: '/dashboard/attendance',
      label: t('attendance'),
      icon: ClipboardCheck,
      show: (canManageStudents || canManageTeachers) && !isTeacher,
    },
    {
      href: '/dashboard/attendance/face-scan',
      label: t('faceScan'),
      icon: ScanFace,
      show: (canManageStudents || canManageTeachers) && !isTeacher,
    },
    {
      href: '/dashboard/attendance/face-enrollment',
      label: t('faceEnrollment'),
      icon: ScanFace,
      show: (canManageStudents || canManageTeachers) && !isTeacher,
    },
    {
      href: '/dashboard/grades',
      label: t('grades'),
      icon: Award,
      show: (canManageStudents || canManageTeachers) && !isTeacher,
    },
    // Notification section (admin/director only)
    {
      href: '/dashboard/notifications/alert-rules',
      label: t('alertRules'),
      icon: Bell,
      show: canManageNotifications,
    },
    {
      href: '/dashboard/notifications/compose',
      label: t('sendNotification'),
      icon: Bell,
      show: canManageNotifications,
    },
    {
      href: '/dashboard/notifications/history',
      label: t('notificationHistory'),
      icon: Bell,
      show: canManageNotifications,
    },
  ];

  const getNavItems = (): NavItem[] => {
    if (isStudent) return studentNavItems;
    if (isTeacher) return teacherNavItems;
    if (isGuardian) return guardianNavItems;
    return adminNavItems;
  };

  const navItems: NavItem[] = getNavItems();

  const bottomItems: NavItem[] = [
    {
      href: '/dashboard/profile',
      label: t('myProfile'),
      icon: User,
      show: true,
    },
    {
      href: '/dashboard/settings',
      label: t('settings'),
      icon: Settings,
      show: canAccessSettings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const NavLink = ({ item, showBadge }: { item: NavItem; showBadge?: boolean }) => {
    if (!item.show) return null;
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => {
          // Close sidebar on mobile after click
          if (window.innerWidth < 1024) onClose();
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px]',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-2 focus-visible:outline-ring',
          active
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
            : 'text-sidebar-foreground/70'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <div className="relative">
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {showBadge && unreadCount && unreadCount > 0 && (
            <Badge
              className={cn(
                'absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold',
                unreadCount > 5 ? 'bg-red-500' : unreadCount > 2 ? 'bg-orange-500' : 'bg-blue-500'
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-all duration-300',
          'lg:relative lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-[68px]' : 'w-64'
        )}
        aria-label={t('mainNavigation')}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-base font-bold text-sidebar-foreground">
                SMS
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
          {/* Close on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden min-h-[44px] min-w-[44px]"
            onClick={onClose}
            aria-label={tc('closeSidebar')}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4 overflow-y-auto">
          <nav className="space-y-1" aria-label={t('mainNavigation')}>
            {navItems.map((item) => (
              <NavLink 
                key={item.href} 
                item={item} 
                showBadge={item.href.includes('notifications')} 
              />
            ))}
          </nav>

          {/* Bottom nav */}
          <div className="border-t px-0 py-4 space-y-1 mt-4">
            {bottomItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </ScrollArea>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex border-t px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full min-h-[44px] justify-center"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </Button>
        </div>
      </aside>
    </>
  );
}

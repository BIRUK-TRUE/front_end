'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/lib/store/auth-store';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  const pathname = usePathname();
  const { 
    canViewUsers, 
    canManageStudents, 
    canManageTeachers, 
    canManageGuardians, 
    canAccessSettings,
    canManageAcademics,
    canManageEnrollments
  } = usePermissions();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/dashboard/users',
      label: t('users'),
      icon: Users,
      show: canViewUsers,
    },
    {
      href: '/dashboard/directors',
      label: 'Directors',
      icon: UserCheck, // Or a Shield/Star icon
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
      label: 'Academics',
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
      label: 'Schedule',
      icon: CalendarClock,
      show: canManageStudents || canManageAcademics,
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
      show: canManageStudents || canManageTeachers,
    },
    {
      href: '/dashboard/grades',
      label: t('grades'),
      icon: Award,
      show: canManageStudents || canManageTeachers,
    },
  ];

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

  const NavLink = ({ item }: { item: NavItem }) => {
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
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1" aria-label={t('mainNavigation')}>
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom nav */}
        <div className="border-t px-3 py-4 space-y-1">
          {bottomItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

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

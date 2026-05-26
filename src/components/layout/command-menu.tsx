'use client';

import * as React from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { usePermissions } from '@/hooks/use-permissions';
import { useUIStore } from '@/lib/store/ui-store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Building2,
  History,
  CalendarClock,
  ClipboardCheck,
  ScanFace,
  Award,
  Bell,
  BarChart3,
  Settings,
  User,
  Sun,
  Moon,
  Laptop,
  Languages,
  Plus,
  Send,
  ShieldAlert,
  Activity,
} from 'lucide-react';

export function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  
  // Custom translation block fallback if commandMenu keys aren't merged yet
  let tCmd: (key: string) => string;
  try {
    tCmd = useTranslations('commandMenu');
  } catch {
    // Graceful fallback to default English labels
    const fallback: Record<string, string> = {
      placeholder: 'Search dashboard, pages, or actions...',
      empty: 'No results found.',
      pages: 'Pages',
      actions: 'Quick Actions',
      theme: 'Theme Settings',
      languages: 'Language Selection',
      lightMode: 'Switch to Light Mode',
      darkMode: 'Switch to Dark Mode',
      systemMode: 'Switch to System Theme',
      english: 'English',
      amharic: 'Amharic (አማርኛ)',
    };
    tCmd = (key: string) => fallback[key] || key;
  }

  const { commandMenuOpen, setCommandMenuOpen, toggleCommandMenu } = useUIStore();
  const permissions = usePermissions();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandMenu();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleCommandMenu]);

  const runCommand = React.useCallback((action: () => void) => {
    setCommandMenuOpen(false);
    action();
  }, [setCommandMenuOpen]);

  // Navigate to link preserving current locale
  const navigate = React.useCallback((href: string) => {
    runCommand(() => router.push(href));
  }, [router, runCommand]);

  // Switch locale and update URL
  const changeLocale = React.useCallback((locale: 'en' | 'am') => {
    runCommand(() => {
      // next-intl router.replace/push preserves or updates the locale
      router.replace(pathname, { locale });
    });
  }, [router, pathname, runCommand]);

  return (
    <CommandDialog
      open={commandMenuOpen}
      onOpenChange={setCommandMenuOpen}
      title={tCmd('placeholder')}
      description="Navigate pages and switch dashboard settings"
    >
      <CommandInput placeholder={tCmd('placeholder')} />
      <CommandList className="max-h-[350px]">
        <CommandEmpty>{tCmd('empty')}</CommandEmpty>
        
        {/* Navigation Group */}
        <CommandGroup heading={tCmd('pages')}>
          {/* General Dashboard */}
          {!permissions.isTeacher && !permissions.isStudent && !permissions.isGuardian && (
            <CommandItem onSelect={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('dashboard')}</span>
            </CommandItem>
          )}

          {/* Teacher Portal Dashboard */}
          {permissions.isTeacher && (
            <CommandItem onSelect={() => navigate('/dashboard/teacher')}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('dashboard')}</span>
            </CommandItem>
          )}

          {/* Student Portal Dashboard */}
          {permissions.isStudent && (
            <CommandItem onSelect={() => navigate('/dashboard/student')}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('dashboard')}</span>
            </CommandItem>
          )}

          {/* Guardian Portal Dashboard */}
          {permissions.isGuardian && (
            <CommandItem onSelect={() => navigate('/dashboard/guardian')}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('dashboard')}</span>
            </CommandItem>
          )}

          {/* Analytics */}
          {permissions.canViewAnalytics && (
            <CommandItem onSelect={() => navigate('/dashboard/analytics')}>
              <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('analytics')}</span>
            </CommandItem>
          )}

          {/* Users */}
          {permissions.canViewUsers && (
            <CommandItem onSelect={() => navigate('/dashboard/users')}>
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('users')}</span>
            </CommandItem>
          )}

          {/* Directors */}
          {permissions.canViewUsers && (
            <CommandItem onSelect={() => navigate('/dashboard/directors')}>
              <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('directors')}</span>
            </CommandItem>
          )}

          {/* Students */}
          {permissions.canManageStudents && (
            <CommandItem onSelect={() => navigate('/dashboard/students')}>
              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('students')}</span>
            </CommandItem>
          )}

          {/* Academics */}
          {permissions.canManageAcademics && (
            <CommandItem onSelect={() => navigate('/dashboard/academics/years')}>
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('academics')}</span>
            </CommandItem>
          )}

          {/* Subjects */}
          {permissions.canManageAcademics && (
            <CommandItem onSelect={() => navigate('/dashboard/academics/subjects')}>
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('subjects')}</span>
            </CommandItem>
          )}

          {/* Subject Assignment */}
          {permissions.canManageAcademics && (
            <CommandItem onSelect={() => navigate('/dashboard/academics/subject-assignment')}>
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('subjectAssignment')}</span>
            </CommandItem>
          )}

          {/* Infrastructure */}
          {permissions.canManageAcademics && (
            <CommandItem onSelect={() => navigate('/dashboard/academics/infrastructure')}>
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Infrastructure</span>
            </CommandItem>
          )}

          {/* Enrollments */}
          {permissions.canManageEnrollments && (
            <CommandItem onSelect={() => navigate('/dashboard/enrollments')}>
              <History className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('enrollments')}</span>
            </CommandItem>
          )}

          {/* Schedule */}
          {(permissions.canManageStudents || permissions.canManageAcademics) && !permissions.isTeacher && (
            <CommandItem onSelect={() => navigate('/dashboard/schedule')}>
              <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('schedule')}</span>
            </CommandItem>
          )}

          {/* Teachers */}
          {permissions.canManageTeachers && (
            <CommandItem onSelect={() => navigate('/dashboard/teachers')}>
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('teachers')}</span>
            </CommandItem>
          )}

          {/* Workload Dashboard */}
          {permissions.canManageTeachers && (
            <CommandItem onSelect={() => navigate('/dashboard/teachers/workload')}>
              <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Workload Dashboard</span>
            </CommandItem>
          )}

          {/* Teacher Assignments */}
          {permissions.canManageTeachers && (
            <CommandItem onSelect={() => navigate('/dashboard/teachers/assignments')}>
              <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Teacher Assignments</span>
            </CommandItem>
          )}

          {/* Guardians */}
          {permissions.canManageGuardians && (
            <CommandItem onSelect={() => navigate('/dashboard/guardians')}>
              <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('guardians')}</span>
            </CommandItem>
          )}

          {/* Attendance (Staff) */}
          {(permissions.canManageStudents || permissions.canManageTeachers) && !permissions.isTeacher && (
            <CommandItem onSelect={() => navigate('/dashboard/attendance')}>
              <ClipboardCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('attendance')}</span>
            </CommandItem>
          )}

          {/* Face Scan */}
          {(permissions.canManageStudents || permissions.canManageTeachers || permissions.canTakeAttendance) && (
            <CommandItem onSelect={() => navigate('/dashboard/attendance/face-scan')}>
              <ScanFace className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('faceScan')}</span>
            </CommandItem>
          )}

          {/* Face Enrollment */}
          {(permissions.canManageStudents || permissions.canManageTeachers) && !permissions.isTeacher && (
            <CommandItem onSelect={() => navigate('/dashboard/attendance/face-enrollment')}>
              <ScanFace className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('faceEnrollment')}</span>
            </CommandItem>
          )}

          {/* Grades (Staff) */}
          {(permissions.canManageStudents || permissions.canManageTeachers) && !permissions.isTeacher && (
            <CommandItem onSelect={() => navigate('/dashboard/grades')}>
              <Award className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('grades')}</span>
            </CommandItem>
          )}

          {/* Notifications (Staff) */}
          {permissions.canManageNotifications && (
            <CommandItem onSelect={() => navigate('/dashboard/notifications')}>
              <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('notifications')}</span>
            </CommandItem>
          )}

          {/* Teacher Portal specific pages */}
          {permissions.canViewOwnClasses && (
            <CommandItem onSelect={() => navigate('/dashboard/teacher/my-classes')}>
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('myClasses')}</span>
            </CommandItem>
          )}

          {permissions.canTakeAttendance && (
            <CommandItem onSelect={() => navigate('/dashboard/teacher/attendance')}>
              <ClipboardCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('attendance')} (Teacher)</span>
            </CommandItem>
          )}

          {permissions.canEnterGrades && (
            <CommandItem onSelect={() => navigate('/dashboard/teacher/grades')}>
              <Award className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('grades')} (Teacher)</span>
            </CommandItem>
          )}

          {permissions.canViewOwnSchedule && (
            <CommandItem onSelect={() => navigate('/dashboard/teacher/schedule')}>
              <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('mySchedule')}</span>
            </CommandItem>
          )}

          {/* Profile & Settings (All roles) */}
          <CommandItem onSelect={() => navigate('/dashboard/profile')}>
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{tNav('myProfile')}</span>
          </CommandItem>

          {permissions.canAccessSettings && (
            <CommandItem onSelect={() => navigate('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tNav('settings')}</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions Group */}
        {(permissions.canViewUsers || permissions.canManageStudents || permissions.canManageTeachers || permissions.canManageGuardians || permissions.canManageNotifications) && (
          <CommandGroup heading={tCmd('actions')}>
            {permissions.canViewUsers && (
              <CommandItem onSelect={() => navigate('/dashboard/users/create')}>
                <Plus className="mr-2 h-4 w-4 text-primary" />
                <span>{tNav('dashboard')}: {tNav('users')} (Create)</span>
              </CommandItem>
            )}

            {permissions.canManageStudents && (
              <CommandItem onSelect={() => navigate('/dashboard/students/create')}>
                <Plus className="mr-2 h-4 w-4 text-primary" />
                <span>{tNav('dashboard')}: {tNav('students')} (Create)</span>
              </CommandItem>
            )}

            {permissions.canManageTeachers && (
              <CommandItem onSelect={() => navigate('/dashboard/teachers/create')}>
                <Plus className="mr-2 h-4 w-4 text-primary" />
                <span>{tNav('dashboard')}: {tNav('teachers')} (Create)</span>
              </CommandItem>
            )}

            {permissions.canManageGuardians && (
              <CommandItem onSelect={() => navigate('/dashboard/guardians/create')}>
                <Plus className="mr-2 h-4 w-4 text-primary" />
                <span>{tNav('dashboard')}: {tNav('guardians')} (Create)</span>
              </CommandItem>
            )}

            {permissions.canManageNotifications && (
              <CommandItem onSelect={() => navigate('/dashboard/notifications/compose')}>
                <Send className="mr-2 h-4 w-4 text-primary" />
                <span>Compose Notification</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Appearance Options */}
        <CommandGroup heading={tCmd('theme')}>
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4 text-amber-500" />
            <span>{tCmd('lightMode')}</span>
            {theme === 'light' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4 text-indigo-400" />
            <span>{tCmd('darkMode')}</span>
            {theme === 'dark' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{tCmd('systemMode')}</span>
            {theme === 'system' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Language Options */}
        <CommandGroup heading={tCmd('languages')}>
          <CommandItem onSelect={() => changeLocale('en')}>
            <Languages className="mr-2 h-4 w-4 text-sky-500" />
            <span>{tCmd('english')}</span>
          </CommandItem>
          <CommandItem onSelect={() => changeLocale('am')}>
            <Languages className="mr-2 h-4 w-4 text-sky-500" />
            <span>{tCmd('amharic')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

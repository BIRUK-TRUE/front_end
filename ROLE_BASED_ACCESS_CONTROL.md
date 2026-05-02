# Role-Based Access Control Analysis

## 1. ROLES DEFINED

### Role names as strings in code:

**'admin'**
- Defined in: `src/lib/permissions.ts` (line 39), `src/lib/api/auth.service.ts` (line 19)
- Code:
```typescript
isAdmin: (roles: string[]) => roles.includes('admin'),
```
```typescript
roles: ['admin'],  // from auth.service.ts mock user
```

**'director'**
- Defined in: `src/lib/permissions.ts` (line 40), `src/lib/api/auth.service.ts` (line 34)
- Code:
```typescript
isDirector: (roles: string[]) => roles.includes('director'),
```
```typescript
roles: ['director'],  // from auth.service.ts mock user
```

**'registrar'**
- Defined in: `src/lib/permissions.ts` (line 41), `src/lib/api/auth.service.ts` (line 64)
- Code:
```typescript
isRegistrar: (roles: string[]) => roles.includes('registrar'),
```
```typescript
roles: ['registrar'],  // from auth.service.ts mock user
```

**'teacher'**
- Defined in: `src/lib/permissions.ts` (line 42), `src/lib/api/auth.service.ts` (line 49)
- Code:
```typescript
isTeacher: (roles: string[]) => roles.includes('teacher'),
```
```typescript
roles: ['teacher'],  // from auth.service.ts mock user
```

**'student'**
- Defined in: `src/lib/permissions.ts` (line 43), `src/lib/api/auth.service.ts` (line 79)
- Code:
```typescript
isStudent: (roles: string[]) => roles.includes('student'),
```
```typescript
roles: ['student'],  // from auth.service.ts mock user
```

**'guardian'**
- Defined in: `src/lib/permissions.ts` (line 44), `src/lib/api/auth.service.ts` (line 94)
- Code:
```typescript
isGuardian: (roles: string[]) => roles.includes('guardian'),
```
```typescript
roles: ['guardian'],  // from auth.service.ts mock user
```

## 2. HOW ROUTING IS PROTECTED

### Protection mechanism:
Component-level protection using `ProtectedRoute` and `RoleGuard` wrapper components with redirect logic.

### Complete ProtectedRoute component:
**File:** `src/components/auth/protected-route.tsx`

```typescript
'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoles?: string[];
}

export function ProtectedRoute({ children, requireRoles }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.must_change_password) {
      router.push('/change-password');
      return;
    }

    if (requireRoles && !requireRoles.some((r) => user.roles.includes(r))) {
      router.push('/dashboard');
    }
  }, [user, isMounted, requireRoles, router, locale]);

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (!user) return null;
  if (user.must_change_password) return null;
  if (requireRoles && !requireRoles.some((r) => user.roles.includes(r))) return null;

  return <>{children}</>;
}
```

### Complete RoleGuard component:
**File:** `src/components/auth/RoleGuard.tsx`

```typescript
"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) return;

    const hasAccess = allowedRoles.some((role) => user.roles.includes(role));

    if (!hasAccess) {
      router.push("/unauthorized");
    }
  }, [user, isHydrated, allowedRoles, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = user && allowedRoles.some((role) => user.roles.includes(role));

  if (!user || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
```

### Protected routes (with role requirements):

**File:** `src/app/[locale]/(dashboard)/guardian/layout.tsx`
```typescript
<ProtectedRoute requireRoles={['guardian']}>
```
- `/dashboard/guardian/*` - Requires `['guardian']`

**File:** `src/app/[locale]/(dashboard)/teacher/layout.tsx`
```typescript
if (!user.roles.includes('teacher')) {
  router.push('/unauthorized');
}
```
- `/dashboard/teacher/*` - Requires `['teacher']`

**File:** `src/app/[locale]/(dashboard)/dashboard/teacher/layout.tsx`
```typescript
<ProtectedRoute requireRoles={["teacher"]}>
```
- `/dashboard/dashboard/teacher/*` - Requires `['teacher']`

**File:** `src/app/[locale]/(dashboard)/dashboard/student/layout.tsx`
```typescript
<ProtectedRoute requireRoles={['student']}>
```
- `/dashboard/dashboard/student/*` - Requires `['student']`

**File:** `src/app/[locale]/(dashboard)/dashboard/guardian/layout.tsx`
```typescript
<ProtectedRoute requireRoles={['guardian']}>
```
- `/dashboard/dashboard/guardian/*` - Requires `['guardian']`

### Public routes:
- `/login` - No authentication required
- `/forgot-password` - No authentication required
- `/reset-password` - No authentication required
- `/unauthorized` - No authentication required

### Protected routes (authentication only, no specific role):

**File:** `src/app/[locale]/(dashboard)/layout.tsx`
```typescript
<ProtectedRoute>
```
- All routes under `/dashboard` require authentication but no specific role

**File:** `src/app/[locale]/(auth)/change-password/page.tsx`
- Requires authentication (redirects to login if not authenticated)

## 3. ROLE-BASED ACCESS

### Permissions defined in permissions.ts:
**File:** `src/lib/permissions.ts`

```typescript
export const permissions = {
  canCreateUser: (roles: string[]) =>
    roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),

  canEditUser: (roles: string[], targetRoles: string[]) => {
    if (roles.includes('admin')) return true;
    if (roles.includes('director')) {
      return !targetRoles.includes('admin');
    }
    if (roles.includes('registrar')) {
      return targetRoles.every((r) => ['student', 'guardian'].includes(r));
    }
    return false;
  },

  canDeleteUser: (roles: string[], targetRoles: string[]) => {
    return permissions.canEditUser(roles, targetRoles);
  },

  canManageStudents: (roles: string[]) =>
    roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),

  canManageTeachers: (roles: string[]) =>
    roles.some((r) => ['admin', 'director'].includes(r)),

  canManageGuardians: (roles: string[]) =>
    roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),

  canViewUsers: (roles: string[]) =>
    roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),

  canRestoreUser: (roles: string[]) => roles.includes('admin'),

  canManageRoles: (roles: string[]) =>
    roles.some((r) => ['admin', 'director'].includes(r)),

  canAccessSettings: (roles: string[]) => roles.includes('admin'),

  canManageAcademics: (roles: string[]) =>
    roles.some((r) => ['admin', 'director'].includes(r)),
    
  canManageEnrollments: (roles: string[]) =>
    roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),

  canViewOwnClasses: (roles: string[]) => roles.includes('teacher'),

  canTakeAttendance: (roles: string[]) =>
    roles.some((r) => ['teacher', 'admin', 'registrar'].includes(r)),

  canEnterGrades: (roles: string[]) =>
    roles.some((r) => ['teacher', 'admin'].includes(r)),

  canViewOwnSchedule: (roles: string[]) => roles.includes('teacher'),

  canViewAnalytics: (roles: string[]) =>
    roles.some((r) => ['admin', 'director'].includes(r)),

  canViewTeacherAnalytics: (roles: string[]) =>
    roles.some((r) => ['teacher', 'admin', 'director'].includes(r)),

  canManageNotifications: (roles: string[]) =>
    roles.some((r) => ['admin', 'director'].includes(r)),
};
```

### Access by role:

**admin:**
- Can access: All pages (canAccessSettings, canManageRoles, canRestoreUser = true)
- Blocked: None
- Permission code: `canAccessSettings: (roles: string[]) => roles.includes('admin')`

**director:**
- Can access: Users, students, teachers, guardians, academics, enrollments, analytics, notifications, attendance, grades, schedule
- Blocked: Settings (canAccessSettings = false), cannot edit/delete admin users
- Permission code: `canAccessSettings: (roles: string[]) => roles.includes('admin')` (director not included)
- Edit user code: `if (roles.includes('director')) { return !targetRoles.includes('admin'); }`

**registrar:**
- Can access: Users, students, guardians, enrollments, attendance
- Blocked: Settings, teachers, academics, analytics, notifications, cannot edit/delete users except students/guardians
- Permission code: `canManageTeachers: (roles: string[]) => roles.some((r) => ['admin', 'director'].includes(r))` (registrar not included)
- Edit user code: `if (roles.includes('registrar')) { return targetRoles.every((r) => ['student', 'guardian'].includes(r)); }`

**teacher:**
- Can access: `/dashboard/teacher/*` routes, own classes, attendance, grades, own schedule, teacher analytics
- Blocked: All admin dashboard routes, settings, user management, academics, enrollments, notifications
- Permission code: `canViewOwnClasses: (roles: string[]) => roles.includes('teacher')`

**student:**
- Can access: `/dashboard/dashboard/student/*` routes (my-attendance, my-grades, my-schedule, my-profile)
- Blocked: All other dashboard routes
- Protected by: `src/app/[locale]/(dashboard)/dashboard/student/layout.tsx` with `requireRoles={['student']}`

**guardian:**
- Can access: `/dashboard/guardian/*` routes (children, notifications, payments, profile)
- Blocked: All other dashboard routes
- Protected by: `src/app/[locale]/(dashboard)/guardian/layout.tsx` with `requireRoles={['guardian']}`

## 4. ROLE-BASED UI

### Sidebar navigation:
**File:** `src/components/layout/sidebar.tsx`

**Teacher-specific nav items:**
```typescript
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
```
- Shows for: teachers only

**Student-specific nav items:**
```typescript
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
```
- Shows for: students only

**Guardian-specific nav items:**
```typescript
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
```
- Shows for: guardians only

**Admin/Registrar/Director nav items:**
```typescript
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
```
- Shows for: admin, director, registrar (not teachers)

### Settings page - Security tab:
**File:** `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx`

```typescript
{canManageSettings && (
  <TabsTrigger value="security" className="gap-2">
    <Shield className="h-4 w-4" /> {ts('tabs.security')}
  </TabsTrigger>
)}
```
- Shows for: admin only (canManageSettings = true only for admin)

### Users page - Create user button:
**File:** `src/app/[locale]/(dashboard)/dashboard/users/page.tsx`

```typescript
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
```
- Shows for: admin, director, registrar (canCreateUser = true for these roles)

### Users page - Restore user option:
**File:** `src/app/[locale]/(dashboard)/dashboard/users/page.tsx`

```typescript
{!user.is_active && canRestoreUser && (
  <DropdownMenuItem
    onClick={() => restoreUser.mutate(user.id)}
    className="flex items-center gap-2"
  >
    <RotateCcw className="h-4 w-4" aria-hidden="true" />
    {tc('restore')}
  </DropdownMenuItem>
)}
```
- Shows for: admin only (canRestoreUser = true only for admin)

### Students page - Create student button:
**File:** `src/app/[locale]/(dashboard)/dashboard/students/page.tsx`

```typescript
actions={
  canManageStudents ? (
    <Link href="/dashboard/students/create">
      <Button className="gap-2 min-h-[44px]">
        <Plus className="h-4 w-4" aria-hidden="true" />
        {t('createStudent')}
      </Button>
    </Link>
  ) : undefined
}
```
- Shows for: admin, director, registrar (canManageStudents = true for these roles)

## 5. HOW ROLE IS DETERMINED

### Role storage:
**File:** `src/lib/store/auth-store.ts`

```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  roles: string[];  // <-- Roles stored as array of strings
  created_at: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: () => void;
}
```

### Role persistence:
```typescript
{
  name: 'auth-storage',
  storage: createJSONStorage(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage;  // <-- Stored in sessionStorage
    }
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }),
  onRehydrateStorage: () => (state) => {
    state?.setHydrated();
  },
}
```
- Storage mechanism: `sessionStorage` via zustand persist middleware
- Storage key: `'auth-storage'`
- Falls back to no-op storage on server-side

### Role determination on login:
**File:** `src/lib/api/auth.service.ts`

```typescript
async login(email: string, password: string) {
  // Try real API first
  try {
    const { data } = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return data;  // Returns user object with roles array
  } catch (apiError: any) {
    // If the API is unreachable (network error), fall back to mock
    if (!apiError.response || apiError.code === 'ERR_NETWORK') {
      console.info('[Auth] API unreachable, using mock login');
      return mockLogin(email, password);  // Mock returns user with roles
    }
    // Otherwise re-throw the real API error (e.g. 401)
    throw apiError;
  }
}
```

### Role reading for access decisions:
**File:** `src/hooks/use-permissions.ts`

```typescript
export function usePermissions() {
  const { user } = useAuthStore();
  const roles = user?.roles || [];  // <-- Read roles from auth store

  return {
    roles,
    canCreateUser: permissions.canCreateUser(roles),
    canViewUsers: permissions.canViewUsers(roles),
    canManageAcademics: permissions.canManageAcademics(roles),
    canManageStudents: permissions.canManageStudents(roles),
    canManageTeachers: permissions.canManageTeachers(roles),
    canManageGuardians: permissions.canManageGuardians(roles),
    canRestoreUser: permissions.canRestoreUser(roles),
    canManageRoles: permissions.canManageRoles(roles),
    canManageEnrollments: permissions.canManageEnrollments(roles),
    canAccessSettings: permissions.canAccessSettings(roles),
    isAdmin: permissions.isAdmin(roles),
    isDirector: permissions.isDirector(roles),
    isRegistrar: permissions.isRegistrar(roles),
    isTeacher: permissions.isTeacher(roles),
    isStudent: permissions.isStudent(roles),
    isGuardian: permissions.isGuardian(roles),
    // Teacher permissions
    canViewOwnClasses: permissions.canViewOwnClasses(roles),
    canTakeAttendance: permissions.canTakeAttendance(roles),
    canEnterGrades: permissions.canEnterGrades(roles),
    canViewOwnSchedule: permissions.canViewOwnSchedule(roles),
    // Analytics permissions
    canViewAnalytics: permissions.canViewAnalytics(roles),
    canViewTeacherAnalytics: permissions.canViewTeacherAnalytics(roles),
    // Notification permissions
    canManageNotifications: permissions.canManageNotifications(roles),
    canEditUser: (targetRoles: string[]) =>
      permissions.canEditUser(roles, targetRoles),
    canDeleteUser: (targetRoles: string[]) =>
      permissions.canDeleteUser(roles, targetRoles),
  };
}
```

### Multi-role support:
**Yes**, the system supports multi-role. The `roles` field is an array of strings (`roles: string[]`).

Permission checks use `roles.some()` to check if user has at least one of the required roles:
```typescript
canCreateUser: (roles: string[]) =>
  roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),
```

### Role changes during session:
**Yes**, roles can change during a session via `updateUser` action in auth store.

**File:** `src/lib/store/auth-store.ts`
```typescript
updateUser: (updates) => {
  const current = get().user;
  if (current) {
    set({ user: { ...current, ...updates } });
  }
},
```
This allows updating the user object (including roles) without requiring re-login.

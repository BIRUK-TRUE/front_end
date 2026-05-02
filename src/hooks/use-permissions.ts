'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { permissions } from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuthStore();
  const roles = user?.roles || [];

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
    canManageSettings: permissions.canAccessSettings(roles),
    canDeleteStudent: permissions.canManageStudents(roles),
    canRestoreStudent: permissions.canManageStudents(roles),
    canDeleteTeacher: permissions.canManageTeachers(roles),
    canRestoreTeacher: permissions.canManageTeachers(roles),
    canDeleteGuardian: permissions.canManageGuardians(roles),
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

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

  isAdmin: (roles: string[]) => roles.includes('admin'),
  isDirector: (roles: string[]) => roles.includes('director'),
  isRegistrar: (roles: string[]) => roles.includes('registrar'),
  isTeacher: (roles: string[]) => roles.includes('teacher'),
  isStudent: (roles: string[]) => roles.includes('student'),
  isGuardian: (roles: string[]) => roles.includes('guardian'),
  
  canManageAcademics: (roles: string[]) =>
    roles.some((r) => ['admin', 'director'].includes(r)),
    
  canManageEnrollments: (roles: string[]) =>
    roles.some((r) => ['admin', 'director', 'registrar'].includes(r)),
};

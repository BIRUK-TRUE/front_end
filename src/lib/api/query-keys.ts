export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  teacher: {
    dashboard: (teacherId: string) => ['teacher', 'dashboard', teacherId] as const,
    classes: (teacherId: string) => ['teacher', 'classes', teacherId] as const,
    classRoster: (sectionId: string) => ['teacher', 'roster', sectionId] as const,
    schedule: (teacherId: string) => ['teacher', 'schedule', teacherId] as const,
    attendanceRecords: (teacherId: string, filters?: object) =>
      ['teacher', 'attendance', teacherId, filters] as const,
    assessments: (teacherId: string, filters?: object) =>
      ['teacher', 'assessments', teacherId, filters] as const,
    assessmentGrades: (assessmentId: string) =>
      ['teacher', 'grades', assessmentId] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters: object) =>
      ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    roles: ['users', 'roles'] as const,
    stats: ['users', 'stats'] as const,
  },
  students: {
    all: ['students'] as const,
    list: (filters: object) =>
      ['students', 'list', filters] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
    stats: ['students', 'stats'] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    list: (filters: object) =>
      ['teachers', 'list', filters] as const,
    detail: (id: string) => ['teachers', 'detail', id] as const,
    stats: ['teachers', 'stats'] as const,
  },
  guardians: {
    all: ['guardians'] as const,
    list: (filters: object) =>
      ['guardians', 'list', filters] as const,
    detail: (id: string) => ['guardians', 'detail', id] as const,
    stats: ['guardians', 'stats'] as const,
    forStudent: (studentId: string) =>
      ['guardians', 'forStudent', studentId] as const,
  },
  studentPortal: {
    dashboard: (studentId: string) =>
      ['studentPortal', 'dashboard', studentId] as const,
    attendance: (studentId: string, filters: object) =>
      ['studentPortal', 'attendance', studentId, filters] as const,
    grades: (studentId: string, filters: object) =>
      ['studentPortal', 'grades', studentId, filters] as const,
    reportCard: (studentId: string, termId: string) =>
      ['studentPortal', 'reportCard', studentId, termId] as const,
    schedule: (studentId: string) =>
      ['studentPortal', 'schedule', studentId] as const,
    profile: (studentId: string) =>
      ['studentPortal', 'profile', studentId] as const,
  },
  guardianPortal: {
    dashboard: (guardianId: string) =>
      ['guardianPortal', 'dashboard', guardianId] as const,
    children: (guardianId: string) =>
      ['guardianPortal', 'children', guardianId] as const,
    childDetails: (studentId: string) =>
      ['guardianPortal', 'childDetails', studentId] as const,
    attendance: (studentId: string, filters: object) =>
      ['guardianPortal', 'attendance', studentId, filters] as const,
    grades: (studentId: string, filters: object) =>
      ['guardianPortal', 'grades', studentId, filters] as const,
    schedule: (studentId: string) =>
      ['guardianPortal', 'schedule', studentId] as const,
    fees: (studentId: string) =>
      ['guardianPortal', 'fees', studentId] as const,
    payments: (studentId: string) =>
      ['guardianPortal', 'payments', studentId] as const,
    notifications: (guardianId: string, filters: object) =>
      ['guardianPortal', 'notifications', guardianId, filters] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    summary: (filters?: object) =>
      ['analytics', 'summary', filters] as const,
    atRisk: (filters?: object) =>
      ['analytics', 'at-risk', filters] as const,
    trend: (filters?: object) =>
      ['analytics', 'attendance-trend', filters] as const,
    distribution: (filters?: object) =>
      ['analytics', 'grade-distribution', filters] as const,
    performance: (termId?: string) =>
      ['analytics', 'class-performance', termId] as const,
  },
  faceRecognition: {
    descriptors: (sectionId: string) =>
      ['faceRecognition', 'descriptors', sectionId] as const,
    enrollmentStatus: (sectionId: string) =>
      ['faceRecognition', 'enrollmentStatus', sectionId] as const,
  },
  sectionStudents: {
    list: (sectionId: string) =>
      ['sectionStudents', 'list', sectionId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unread: (userId: string) => ['notifications', 'unread', userId] as const,
    history: (filters?: object) => ['notifications', 'history', filters] as const,
    detail: (id: string) => ['notifications', 'detail', id] as const,
    alertRules: ['notifications', 'alert-rules'] as const,
  },
  settings: {
    schoolInfo: ['settings', 'school-info'] as const,
    academic: ['settings', 'academic'] as const,
    notifications: ['settings', 'notifications'] as const,
  },
};

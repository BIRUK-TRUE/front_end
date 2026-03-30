export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
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
};

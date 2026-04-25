'use client';

import { useQuery } from '@tanstack/react-query';
import { teachersService, type TeacherFilters } from '@/lib/api/teachers.service';

export const teachersKeys = {
  all: ['teachers'] as const,
  lists: () => [...teachersKeys.all, 'list'] as const,
  list: (filters: TeacherFilters) => [...teachersKeys.lists(), filters] as const,
  details: () => [...teachersKeys.all, 'detail'] as const,
  detail: (id: string) => [...teachersKeys.details(), id] as const,
};

export const useTeachers = (filters: TeacherFilters = {}) => {
  return useQuery({
    queryKey: teachersKeys.list(filters),
    queryFn: () => teachersService.getAll(filters),
    enabled: true,
  });
};

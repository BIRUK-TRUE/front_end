'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { type Student, type PaginatedResponse } from "../types";
import { academicsKeys } from "./useSubjects";

/**
 * Hook to fetch students enrolled in a specific section
 * GET /sections/{sectionId}/students
 */
export const useSectionStudents = (sectionId: string, page = 1, size = 100) => {
  return useQuery({
    queryKey: [...academicsKeys.all, "sections", sectionId, "students", { page, size }],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Student>>(
        `/academics/sections/${sectionId}/students`,
        {
          params: { page, size },
        }
      );
      return data;
    },
    enabled: !!sectionId,
  });
};

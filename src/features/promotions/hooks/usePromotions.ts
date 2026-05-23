/**
 * Promotion Hooks
 * ===============
 * React Query hooks for promotion and enrollment management.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promotionsService } from '@/lib/api/promotions.service';
import type {
  PromotionPreviewRequest,
  PromotionExecuteRequest,
  BulkEnrollmentImportRequest,
} from '@/features/promotions/types';

// ==========================================
// QUERY KEYS
// ==========================================

export const promotionKeys = {
  all: ['promotions'] as const,
  preview: (params: PromotionPreviewRequest) =>
    [...promotionKeys.all, 'preview', params] as const,
  capacities: (yearId: string) =>
    [...promotionKeys.all, 'capacities', yearId] as const,
  unassigned: (yearId: string) =>
    [...promotionKeys.all, 'unassigned', yearId] as const,
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Hook to generate a promotion preview.
 */
export function usePromotionPreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromotionPreviewRequest) =>
      promotionsService.previewPromotion(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: promotionKeys.capacities(variables.academic_year_id),
      });
      
      toast.success('Promotion preview generated successfully', {
        description: `${data.total_students} students processed`,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to generate preview';
      toast.error('Preview Failed', { description: message });
    },
  });
}

/**
 * Hook to execute a promotion.
 */
export function useExecutePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromotionExecuteRequest) =>
      promotionsService.executePromotion(data),
    onSuccess: (data) => {
      // Invalidate all promotion-related queries
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      
      if (data.success) {
        toast.success('Promotion Executed Successfully', {
          description: `${data.successful_promotions} promoted, ${data.successful_repetitions} repeated`,
        });
      } else {
        toast.warning('Promotion Completed with Errors', {
          description: `${data.failed_count} students failed to process`,
        });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to execute promotion';
      toast.error('Execution Failed', { description: message });
    },
  });
}

/**
 * Hook to bulk import students.
 */
export function useBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkEnrollmentImportRequest) =>
      promotionsService.bulkImportStudents(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      
      if (data.success) {
        toast.success('Import Successful', {
          description: `${data.successful_imports} students imported`,
        });
      } else {
        toast.warning('Import Completed with Errors', {
          description: `${data.failed_count} records failed`,
        });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to import students';
      toast.error('Import Failed', { description: message });
    },
  });
}

// ==========================================
// QUERIES
// ==========================================

/**
 * Hook to get section capacities for an academic year.
 */
export function useSectionCapacities(academicYearId: string) {
  return useQuery({
    queryKey: promotionKeys.capacities(academicYearId),
    queryFn: () => promotionsService.checkCapacities(academicYearId),
    enabled: !!academicYearId,
  });
}

/**
 * Hook to get unassigned students for an academic year.
 */
export function useUnassignedStudents(academicYearId: string) {
  return useQuery({
    queryKey: promotionKeys.unassigned(academicYearId),
    queryFn: () => promotionsService.getUnassignedStudents(academicYearId),
    enabled: !!academicYearId,
  });
}

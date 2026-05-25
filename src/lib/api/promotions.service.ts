/**
 * Promotions API Service
 * ======================
 * Axios-based service for promotion and enrollment management APIs.
 */

import { axiosInstance } from '@/lib/api/axios';
import type {
  PromotionPreviewRequest,
  PromotionPreviewResponse,
  PromotionExecuteRequest,
  PromotionResultResponse,
  BulkEnrollmentImportRequest,
  BulkImportResultResponse,
  CapacityCheckResponse,
  UnassignedStudentItem,
} from '@/features/promotions/types';

export const promotionsService = {
  /**
   * Generate a promotion preview.
   * POST /promotions/preview
   */
  async previewPromotion(
    data: PromotionPreviewRequest
  ): Promise<PromotionPreviewResponse> {
    const { data: response } = await axiosInstance.post<PromotionPreviewResponse>(
      '/promotions/preview',
      data
    );
    return response;
  },

  /**
   * Execute a promotion after confirmation.
   * POST /promotions/execute
   */
  async executePromotion(
    data: PromotionExecuteRequest
  ): Promise<PromotionResultResponse> {
    const { data: response } = await axiosInstance.post<PromotionResultResponse>(
      '/promotions/execute',
      data
    );
    return response;
  },

  /**
   * Bulk import students for new school setup.
   * POST /promotions/bulk-import
   */
  async bulkImportStudents(
    data: BulkEnrollmentImportRequest
  ): Promise<BulkImportResultResponse> {
    const { data: response } = await axiosInstance.post<BulkImportResultResponse>(
      '/promotions/bulk-import',
      data
    );
    return response;
  },

  /**
   * Check section capacities for an academic year.
   * GET /promotions/capacity-check/{academic_year_id}
   */
  async checkCapacities(academicYearId: string): Promise<CapacityCheckResponse> {
    const { data } = await axiosInstance.get<CapacityCheckResponse>(
      `/promotions/capacity-check/${academicYearId}`
    );
    return data;
  },

  /**
   * List unassigned students for an academic year.
   * GET /promotions/unassigned-students/{academic_year_id}
   */
  async getUnassignedStudents(
    academicYearId: string
  ): Promise<{ count: number; students: UnassignedStudentItem[] }> {
    const { data } = await axiosInstance.get<{
      count: number;
      students: UnassignedStudentItem[];
    }>(`/promotions/unassigned-students/${academicYearId}`);
    return data;
  },

  /**
   * Rebalance sections for a grade level.
   * POST /promotions/rebalance-sections/{grade_level}
   */
  async rebalanceSections(
    gradeLevel: number,
    academicYearId: string
  ): Promise<any> {
    const { data } = await axiosInstance.post(
      `/promotions/rebalance-sections/${gradeLevel}`,
      null,
      { params: { academic_year_id: academicYearId } }
    );
    return data;
  },
};

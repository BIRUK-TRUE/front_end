import { axiosInstance } from './axios';

export interface FaceEnrollmentResponse {
  student_id: string;
  enrollment_status: string;
  message: string;
  enrolled_at?: string;
}

export interface EnrollmentStatusResponse {
  student_id: string;
  student_name: string;
  is_enrolled: boolean;
  enrolled_at?: string;
  photo_count: number;
}

/**
 * Face Recognition Service
 * 
 * TODO: Face recognition module not yet implemented in backend.
 * All methods return stub/mock data until /face-recognition/* endpoints are created.
 */
export const faceRecognitionService = {
  enrollFace: async (studentId: string, photo: File): Promise<FaceEnrollmentResponse> => {
    // TODO: Backend endpoint /face-recognition/enroll/{studentId} not yet implemented
    return {
      student_id: studentId,
      enrollment_status: 'pending',
      message: 'Face recognition not yet available',
    };
  },

  getEnrollmentStatus: async (studentId: string): Promise<EnrollmentStatusResponse> => {
    // TODO: Backend endpoint /face-recognition/enrollment-status/{studentId} not yet implemented
    return {
      student_id: studentId,
      student_name: '',
      is_enrolled: false,
      photo_count: 0,
    };
  },

  deleteEnrollment: async (studentId: string): Promise<{ message: string }> => {
    // TODO: Backend endpoint DELETE /face-recognition/enroll/{studentId} not yet implemented
    return {
      message: 'Face recognition not yet available',
    };
  },

  recognizeInSection: async (sectionId: string, photo: File): Promise<{ recognized_student_ids: string[]; count: number }> => {
    // TODO: Backend endpoint /face-recognition/recognize/section/{sectionId} not yet implemented
    return {
      recognized_student_ids: [],
      count: 0,
    };
  },
};

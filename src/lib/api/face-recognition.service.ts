import { axiosInstance } from "./axios";

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

export const faceRecognitionService = {
  enrollFace: async (
    studentId: string,
    descriptors: number[][],
  ): Promise<FaceEnrollmentResponse> => {
    const { data } = await axiosInstance.post("/face-recognition/enroll", {
      studentId,
      descriptors,
    });
    return data;
  },

  getEnrollmentStatus: async (
    studentId: string,
  ): Promise<EnrollmentStatusResponse> => {
    const { data } = await axiosInstance.get(
      `/face-recognition/enrollment-status/${studentId}`,
    );
    return data;
  },

  deleteEnrollment: async (studentId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(
      `/face-recognition/enroll/${studentId}`,
    );
    return data;
  },

  recognizeInSection: async (
    _sectionId: string,
    _photo: File,
  ): Promise<{ recognized_student_ids: string[]; count: number }> => {
    return {
      recognized_student_ids: [],
      count: 0,
    };
  },
};

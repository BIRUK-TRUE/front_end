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

export interface FaceMatchResult {
  studentId: string;
  studentName: string;
  confidence: number;
  distance: number;
  enrollmentId: string;
}

export interface FaceRecognitionResponse {
  matches: FaceMatchResult[];
  recognizedCount: number;
  message: string;
  sectionId: string;
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

  recognizeFace: async (
    sectionId: string,
    descriptors: number[][],
    threshold?: number,
  ): Promise<FaceRecognitionResponse> => {
    const { data } = await axiosInstance.post("/face-recognition/recognize", {
      sectionId,
      descriptors,
      threshold: threshold ?? 0.6,
    });
    return data;
  },
};

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

export const faceRecognitionService = {
  enrollFace: async (studentId: string, photo: File): Promise<FaceEnrollmentResponse> => {
    const formData = new FormData();
    formData.append('photo', photo);
    const { data } = await axiosInstance.post<FaceEnrollmentResponse>(
      `/face-recognition/enroll/${studentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  getEnrollmentStatus: async (studentId: string): Promise<EnrollmentStatusResponse> => {
    const { data } = await axiosInstance.get<EnrollmentStatusResponse>(
      `/face-recognition/enrollment-status/${studentId}`
    );
    return data;
  },

  deleteEnrollment: async (studentId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete<{ message: string }>(
      `/face-recognition/enroll/${studentId}`
    );
    return data;
  },

  recognizeInSection: async (sectionId: string, photo: File): Promise<{ recognized_student_ids: string[]; count: number }> => {
    const formData = new FormData();
    formData.append('photo', photo);
    const { data } = await axiosInstance.post<{ recognized_student_ids: string[]; count: number }>(
      `/face-recognition/recognize/section/${sectionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },
};

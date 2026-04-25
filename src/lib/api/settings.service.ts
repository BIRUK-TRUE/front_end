import { axiosInstance } from "./axios";

export interface SchoolInfo {
  school_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
}

export interface AcademicSettings {
  grading_scale: Record<string, number>;
  passing_mark: number;
  attendance_warning_threshold: number;
  confidence_threshold: number;
}

export interface NotificationSettings {
  absence_alert: boolean;
  low_grade_alert: boolean;
  fee_reminder: boolean;
  consecutive_absence_threshold: number;
}

export const settingsService = {
  getSchoolInfo: async () => {
    const { data } = await axiosInstance.get<SchoolInfo>('/settings/school-info');
    return data;
  },
  updateSchoolInfo: async (data: Partial<SchoolInfo>) => {
    const response = await axiosInstance.patch('/settings/school-info', data);
    return response.data;
  },

  getAcademicSettings: async () => {
    const { data } = await axiosInstance.get<AcademicSettings>('/settings/academic');
    return data;
  },
  updateAcademicSettings: async (data: Partial<AcademicSettings>) => {
    const response = await axiosInstance.patch('/settings/academic', data);
    return response.data;
  },

  getNotificationSettings: async () => {
    const { data } = await axiosInstance.get<NotificationSettings>('/settings/notifications');
    return data;
  },
  updateNotificationSettings: async (data: Partial<NotificationSettings>) => {
    const response = await axiosInstance.patch('/settings/notifications', data);
    return response.data;
  },
};

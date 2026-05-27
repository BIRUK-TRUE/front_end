import { axiosInstance } from './axios';

export interface SchoolInfo {
  school_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  school_logo?: string | null;
  school_tagline?: string | null;
  primary_color?: string | null;
  school_code?: string | null;
  website?: string | null;
  region?: string | null;
  zone?: string | null;
  woreda?: string | null;
}

export interface AcademicSettings {
  grading_scale: Record<string, number>;
  passing_mark: number;
  attendance_warning_threshold: number;
  confidence_threshold: number;
  late_arrival_time: string; // HH:MM format
}

export interface NotificationSettings {
  absence_alert: boolean;
  low_grade_alert: boolean;
  fee_reminder: boolean;
  consecutive_absence_threshold: number;
  email_notifications_enabled?: boolean;
}

export const settingsService = {
  getSchoolInfo: async (): Promise<SchoolInfo> => {
    const response = await axiosInstance.get('/settings/system/school-info');
    return response.data;
  },

  updateSchoolInfo: async (data: Partial<SchoolInfo>) => {
    const response = await axiosInstance.patch('/settings/system/school-info', data);
    return response.data;
  },

  getAcademicSettings: async (): Promise<AcademicSettings> => {
    const response = await axiosInstance.get('/settings/academic');
    return response.data;
  },

  updateAcademicSettings: async (data: Partial<AcademicSettings>) => {
    const response = await axiosInstance.patch('/settings/academic', data);
    return response.data;
  },

  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await axiosInstance.get('/settings/notifications');
    return response.data;
  },

  updateNotificationSettings: async (data: Partial<NotificationSettings>) => {
    const response = await axiosInstance.patch('/settings/notifications', data);
    return response.data;
  },
  
  // SMS providers — stubbed for future implementation
  getSmsProviders: async () => {
    return [];
  },
  activateSmsProvider: async (providerId: string) => {
    void providerId;
    return { message: "SMS providers not yet configured" };
  },
  getSmsLogs: async (limit = 50, offset = 0) => {
    void limit;
    void offset;
    return [];
  },
  testSms: async (payload: { phone: string; message: string }) => {
    void payload;
    return { message: "SMS test not yet available" };
  },
};

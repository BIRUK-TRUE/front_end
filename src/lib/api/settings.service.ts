import { axiosInstance } from "./axios";

export interface SchoolInfo {
  school_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
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
}

export interface NotificationSettings {
  absence_alert: boolean;
  low_grade_alert: boolean;
  fee_reminder: boolean;
  consecutive_absence_threshold: number;
}

/**
 * Settings service.
 *
 * NOTE: The backend does not have a dedicated /settings module yet.
 * Most methods return sensible defaults. They will be connected to
 * real backend endpoints once the settings module is implemented.
 */
export const settingsService = {
  /**
   * Get school info.
   * TODO: Backend endpoint /settings/school-info not yet implemented.
   */
  getSchoolInfo: async (): Promise<SchoolInfo> => {
    // Return defaults until settings module exists in backend
    return {
      school_name: "School Management System",
      address: "",
      phone: "",
      email: "",
      logo_url: null,
      school_code: null,
      website: null,
      region: null,
      zone: null,
      woreda: null,
    };
  },

  updateSchoolInfo: async (_data: Partial<SchoolInfo>) => {
    // TODO: PATCH /settings/school-info
    return _data;
  },

  /**
   * Get academic settings.
   * TODO: Backend endpoint /settings/academic not yet implemented.
   */
  getAcademicSettings: async (): Promise<AcademicSettings> => {
    return {
      grading_scale: { A: 90, B: 80, C: 70, D: 60, F: 0 },
      passing_mark: 50,
      attendance_warning_threshold: 80,
      confidence_threshold: 75,
    };
  },

  updateAcademicSettings: async (_data: Partial<AcademicSettings>) => {
    // TODO: PATCH /settings/academic
    return _data;
  },

  /**
   * Get notification settings.
   * TODO: Backend endpoint /settings/notifications not yet implemented.
   */
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    return {
      absence_alert: true,
      low_grade_alert: true,
      fee_reminder: true,
      consecutive_absence_threshold: 3,
    };
  },

  updateNotificationSettings: async (_data: Partial<NotificationSettings>) => {
    // TODO: PATCH /settings/notifications
    return _data;
  },

  /**
   * SMS providers — stubbed.
   */
  getSmsProviders: async () => {
    return [];
  },
  activateSmsProvider: async (_providerId: string) => {
    return { message: "SMS providers not yet configured" };
  },
  getSmsLogs: async (_limit = 50, _offset = 0) => {
    return [];
  },
  testSms: async (_payload: { phone: string; message: string }) => {
    return { message: "SMS test not yet available" };
  },
};

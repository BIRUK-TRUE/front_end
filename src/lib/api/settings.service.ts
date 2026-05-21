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
}

export interface NotificationSettings {
  absence_alert: boolean;
  low_grade_alert: boolean;
  fee_reminder: boolean;
  consecutive_absence_threshold: number;
}

const SCHOOL_INFO_STORAGE_KEY = "sms.schoolInfo";

const defaultSchoolInfo: SchoolInfo = {
  school_name: "School Management System",
  address: "",
  phone: "",
  email: "",
  logo_url: null,
  school_logo: null,
  school_tagline: "",
  primary_color: "#2563EB",
  school_code: null,
  website: null,
  region: null,
  zone: null,
  woreda: null,
};

function readLocalSchoolInfo(): Partial<SchoolInfo> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(SCHOOL_INFO_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalSchoolInfo(data: SchoolInfo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCHOOL_INFO_STORAGE_KEY, JSON.stringify(data));
}

export const settingsService = {
  getSchoolInfo: async (): Promise<SchoolInfo> => {
    return {
      ...defaultSchoolInfo,
      ...readLocalSchoolInfo(),
    };
  },

  updateSchoolInfo: async (data: Partial<SchoolInfo>) => {
    const next = {
      ...defaultSchoolInfo,
      ...readLocalSchoolInfo(),
      ...data,
      logo_url: data.school_logo ?? data.logo_url ?? readLocalSchoolInfo().logo_url ?? null,
      school_logo: data.school_logo ?? data.logo_url ?? readLocalSchoolInfo().school_logo ?? null,
    };
    writeLocalSchoolInfo(next);
    return next;
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

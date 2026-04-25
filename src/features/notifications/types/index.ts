export enum NotificationType {
  ATTENDANCE = 'attendance',
  GRADE = 'grade',
  FEE = 'fee',
  SCHEDULE = 'schedule',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system',
  ABSENCE = 'absence',
  LATE = 'late',
  GRADE_ALERT = 'grade_alert',
  ATTENDANCE_ALERT = 'attendance_alert',
  FEE_REMINDER = 'fee_reminder',
  FEE_OVERDUE = 'fee_overdue',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  user_id: string;
  link?: string;
  icon?: string;
  is_automated?: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  trigger: string;
  recipients: ('guardian' | 'teacher' | 'director' | 'admin')[];
  channels: ('in_app' | 'sms' | 'email')[];
  enabled: boolean;
  template: string;
  config?: Record<string, any>;
}

export interface NotificationHistory {
  id: string;
  title: string;
  message_preview: string;
  sent_at: string;
  sent_by_name: string;
  recipient_count: number;
  type: 'automatic' | 'manual';
  status: {
    delivered: number;
    pending: number;
    failed: number;
  };
}

export interface RecipientStatus {
  id: string;
  recipient_name: string;
  recipient_role: string;
  status: 'delivered' | 'pending' | 'failed';
  error_message?: string;
  delivered_at?: string;
}

export interface NotificationDetail extends NotificationHistory {
  full_message: string;
  recipients: RecipientStatus[];
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  attendance_alerts: boolean;
  grade_published: boolean;
  fee_reminders: boolean;
  schedule_changes: boolean;
  announcement_alerts: boolean;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  targetType: 'all_students' | 'all_guardians' | 'all_teachers' | 'class' | 'section' | 'individual';
  targetIds: string[];
  channels: ('in_app' | 'sms' | 'email')[];
  scheduledAt: string | null;
}

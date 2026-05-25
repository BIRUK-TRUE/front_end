import { axiosInstance } from './axios';

export const notificationsService = {
  // Announcements
  async getAnnouncements(params: { page?: number; size?: number; include_unpublished?: boolean } = {}) {
    const { data } = await axiosInstance.get('/announcements', { params });
    return data;
  },

  async getAnnouncement(id: string) {
    const { data } = await axiosInstance.get(`/announcements/${id}`);
    return data;
  },

  async createAnnouncement(payload: {
    title: string;
    content: string;
    target_roles?: string[];
    is_published?: boolean;
    publish_at?: string;
  }) {
    const { data } = await axiosInstance.post('/announcements', payload);
    return data;
  },

  async updateAnnouncement(id: string, payload: Partial<{ title: string; content: string; is_published: boolean }>) {
    const { data } = await axiosInstance.patch(`/announcements/${id}`, payload);
    return data;
  },

  // My notifications (inbox)
  async getMyNotifications(params: { page?: number; size?: number; status?: string } = {}) {
    const { data } = await axiosInstance.get('/notifications/me', { params });
    return data;
  },

  async getUnreadCount() {
    const { data } = await axiosInstance.get('/notifications/me/unread-count');
    return data;
  },

  async markRead(notificationId: string) {
    const { data } = await axiosInstance.patch(`/notifications/${notificationId}/read`, {});
    return data;
  },

  async markAllRead() {
    const { data } = await axiosInstance.patch('/notifications/me/read-all', {});
    return data;
  },

  async archiveNotification(notificationId: string) {
    const { data } = await axiosInstance.patch(`/notifications/${notificationId}/archive`, {});
    return data;
  },

  // Send notification (admin)
  async send(payload: {
    title: string;
    message: string;
    target_user_ids?: string[];
    target_roles?: string[];
  }) {
    const { data } = await axiosInstance.post('/notifications/send', payload);
    return data;
  },

  // Notification history (admin)
  async getHistory(params: { page?: number; size?: number; search?: string } = {}) {
    const { data } = await axiosInstance.get('/notifications/history', { params });
    return data;
  },

  // Preview recipients
  async previewRecipients(payload: { targetIds?: string[]; targetRoles?: string[] }) {
    const { data } = await axiosInstance.post('/notifications/preview-recipients', payload);
    return data;
  },

  // Notification rules (stub)
  async getRules() {
    const { data } = await axiosInstance.get('/notification-rules');
    return data;
  },

  async updateRule(ruleId: string, payload: Record<string, unknown>) {
    const { data } = await axiosInstance.patch(`/notification-rules/${ruleId}`, payload);
    return data;
  },

  async toggleRule(ruleId: string, enabled: boolean) {
    const { data } = await axiosInstance.patch(`/notification-rules/${ruleId}/toggle`, { enabled });
    return data;
  },
};

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNotifications, useUnreadNotifications } from '../api/useNotifications';
import { NotificationType, NotificationPriority } from '../types';
import type { Notification } from '../types';

interface UseRealtimeToastsOptions {
  userId: string;
  enabled?: boolean;
  filterTypes?: NotificationType[];
  minPriority?: NotificationPriority;
}

const notificationSounds: Record<NotificationPriority, string | null> = {
  [NotificationPriority.LOW]: null,
  [NotificationPriority.MEDIUM]: null,
  [NotificationPriority.HIGH]: '/sounds/notification-high.mp3',
  [NotificationPriority.URGENT]: '/sounds/notification-urgent.mp3',
};

const typeEmojis: Record<NotificationType, string> = {
  [NotificationType.ATTENDANCE]: '✅',
  [NotificationType.GRADE]: '📝',
  [NotificationType.FEE]: '💰',
  [NotificationType.SCHEDULE]: '📅',
  [NotificationType.ANNOUNCEMENT]: '📢',
  [NotificationType.SYSTEM]: '⚙️',
  [NotificationType.ABSENCE]: '❌',
  [NotificationType.LATE]: '⏰',
  [NotificationType.GRADE_ALERT]: '📊',
  [NotificationType.ATTENDANCE_ALERT]: '🔔',
  [NotificationType.FEE_REMINDER]: '💳',
  [NotificationType.FEE_OVERDUE]: '⚠️',
};

const priorityOrder: NotificationPriority[] = [
  NotificationPriority.LOW,
  NotificationPriority.MEDIUM,
  NotificationPriority.HIGH,
  NotificationPriority.URGENT,
];

export function useRealtimeToasts({
  userId,
  enabled = true,
  filterTypes,
  minPriority = NotificationPriority.MEDIUM,
}: UseRealtimeToastsOptions) {
  const { data: notifications = [] } = useNotifications(userId);
  const { data: unreadCount = 0 } = useUnreadNotifications(userId);

  const minPriorityIndex = priorityOrder.indexOf(minPriority);

  const playSound = useCallback((priority: NotificationPriority) => {
    const soundPath = notificationSounds[priority];
    if (soundPath) {
      const audio = new Audio(soundPath);
      audio.play().catch(() => {
        // Ignore audio play errors (e.g., user interaction required)
      });
    }
  }, []);

  const showToast = useCallback((notification: Notification) => {
    const emoji = typeEmojis[notification.type];
    const title = `${emoji} ${notification.title}`;

    const toastOptions = {
      duration: notification.priority === 'urgent' ? 10000 : 5000,
      action: notification.link
        ? {
            label: 'View',
            onClick: () => {
              window.open(notification.link, '_self');
            },
          }
        : undefined,
    };

    switch (notification.priority) {
      case NotificationPriority.URGENT:
        toast.error(title, {
          ...toastOptions,
          description: notification.message,
        });
        break;
      case NotificationPriority.HIGH:
        toast.warning(title, {
          ...toastOptions,
          description: notification.message,
        });
        break;
      case NotificationPriority.MEDIUM:
        toast.info(title, {
          ...toastOptions,
          description: notification.message,
        });
        break;
      case NotificationPriority.LOW:
        toast.success(title, {
          ...toastOptions,
          description: notification.message,
        });
        break;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !notifications.length) return;

    // Find unread notifications that haven't been toasted yet
    const unreadNotifications = notifications.filter(
      (n) => !n.read_at && !sessionStorage.getItem(`toast-shown-${n.id}`)
    );

    unreadNotifications.forEach((notification) => {
      // Check if type is filtered
      if (filterTypes && !filterTypes.includes(notification.type)) {
        return;
      }

      // Check if priority meets minimum
      const notificationPriorityIndex = priorityOrder.indexOf(notification.priority);
      if (notificationPriorityIndex < minPriorityIndex) {
        return;
      }

      // Show toast
      showToast(notification);

      // Play sound for high/urgent
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        playSound(notification.priority);
      }

      // Mark as shown in this session
      sessionStorage.setItem(`toast-shown-${notification.id}`, 'true');
    });
  }, [notifications, enabled, filterTypes, minPriority, minPriorityIndex, showToast, playSound]);

  // Clear old session storage entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('toast-shown-')) {
          const timestamp = sessionStorage.getItem(`${key}-time`);
          if (timestamp && now - Number(timestamp) > oneHour) {
            sessionStorage.removeItem(key);
            sessionStorage.removeItem(`${key}-time`);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    notifications,
  };
}

// Helper hook for specific attendance notifications
export function useAttendanceToasts(userId: string) {
  return useRealtimeToasts({
    userId,
    filterTypes: [NotificationType.ATTENDANCE],
    minPriority: NotificationPriority.MEDIUM,
  });
}

// Helper hook for fee notifications
export function useFeeToasts(userId: string) {
  return useRealtimeToasts({
    userId,
    filterTypes: [NotificationType.FEE],
    minPriority: NotificationPriority.HIGH,
  });
}

// Helper hook for grade notifications
export function useGradeToasts(userId: string) {
  return useRealtimeToasts({
    userId,
    filterTypes: [NotificationType.GRADE],
    minPriority: NotificationPriority.MEDIUM,
  });
}

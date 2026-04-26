'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useNotifications, useMarkAsRead } from '@/features/notifications/api/useNotifications';
import { Bell, AlertTriangle, TrendingDown, Calendar, Info, CheckCircle2 } from 'lucide-react';
import type { Notification } from '@/features/notifications/types';

interface NotificationListenerProps {
  userId: string;
}

export function NotificationListener({ userId }: NotificationListenerProps) {
  const t = useTranslations('notifications.listener');
  const { data: notifications } = useNotifications(userId);
  const markAsRead = useMarkAsRead();

  const previousNotificationsRef = useRef<Notification[]>([]);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!notifications) return;

    const newNotifications = notifications.filter(
      (notif) => !previousNotificationsRef.current.some((prev) => prev.id === notif.id) && !processedIds.has(notif.id)
    );

    if (newNotifications.length > 0) {
      newNotifications.forEach((notification) => {
        showToast(notification);
        setProcessedIds((prev) => new Set(prev).add(notification.id));
      });
    }

    previousNotificationsRef.current = notifications;
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'absence_alert':
      case 'attendance_alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'grade_alert':
      case 'low_grade':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'fee_reminder':
      case 'fee_overdue':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-slate-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const showToast = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);

    toast(notification.title, {
      description: notification.message.substring(0, 100) + (notification.message.length > 100 ? '...' : ''),
      icon,
      action: {
        label: t('markAsRead'),
        onClick: () => markAsRead.mutate(notification.id),
      },
      onDismiss: () => {
        markAsRead.mutate(notification.id);
      },
    });
  };

  return null; // This component doesn't render anything
}

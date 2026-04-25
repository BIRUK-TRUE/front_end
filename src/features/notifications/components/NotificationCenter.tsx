'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Info, 
  GraduationCap, 
  Wallet, 
  Calendar, 
  Megaphone, 
  Settings, 
  ExternalLink,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { NotificationType, NotificationPriority } from '../types';
import type { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const typeIcons: Record<NotificationType, any> = {
  [NotificationType.ATTENDANCE]: Clock,
  [NotificationType.GRADE]: GraduationCap,
  [NotificationType.FEE]: Wallet,
  [NotificationType.SCHEDULE]: Calendar,
  [NotificationType.ANNOUNCEMENT]: Megaphone,
  [NotificationType.SYSTEM]: Info,
  [NotificationType.ABSENCE]: AlertTriangle,
  [NotificationType.LATE]: Clock,
  [NotificationType.GRADE_ALERT]: Zap,
  [NotificationType.ATTENDANCE_ALERT]: Bell,
  [NotificationType.FEE_REMINDER]: Wallet,
  [NotificationType.FEE_OVERDUE]: AlertTriangle,
};

const priorityStyles: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  [NotificationPriority.MEDIUM]: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  [NotificationPriority.HIGH]: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  [NotificationPriority.URGENT]: 'bg-red-500/10 text-red-600 border-red-500/30 animate-pulse',
};

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const t = useTranslations('notifications.center');

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read_at;
    if (activeTab === 'smart') return n.is_automated || [
      NotificationType.ABSENCE, NotificationType.LATE, NotificationType.GRADE_ALERT, 
      NotificationType.ATTENDANCE_ALERT, NotificationType.FEE_REMINDER, NotificationType.FEE_OVERDUE
    ].includes(n.type);
    return n.type === activeTab;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.open(notification.link, '_self');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-primary/5">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black border-2 border-background animate-in zoom-in">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 rounded-l-[40px] border-none shadow-2xl overflow-hidden">
        <SheetHeader className="px-8 py-8 border-b bg-primary">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-white text-2xl font-black italic">
              <Bell className="h-6 w-6" />
              {t('title')}
            </SheetTitle>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="h-9 gap-2 text-white hover:bg-white/10 rounded-xl font-bold text-xs"
                >
                  <CheckCheck className="h-4 w-4" />
                  {t('markAllRead')}
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-140px)]">
          <TabsList className="grid grid-cols-4 mx-6 mt-6 p-1 bg-muted/30 rounded-2xl">
            <TabsTrigger value="all" className="text-[10px] font-black uppercase rounded-xl">{t('tabAll')}</TabsTrigger>
            <TabsTrigger value="unread" className="text-[10px] font-black uppercase rounded-xl">{unreadCount > 0 && <span className="mr-1">{unreadCount}</span>} {t('tabUnread')}</TabsTrigger>
            <TabsTrigger value="smart" className="text-[10px] font-black uppercase rounded-xl flex items-center gap-1">
              <Zap className="h-3 w-3" /> {t('tabSmart')}
            </TabsTrigger>
            <TabsTrigger value="announcement" className="text-[10px] font-black uppercase rounded-xl">{t('tabNews')}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 mt-4">
            <ScrollArea className="h-full px-6">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-3 pb-8">
                  {filteredNotifications.map((notification) => {
                    const Icon = typeIcons[notification.type] || Bell;
                    const isUnread = !notification.read_at;
                    const isSmart = notification.is_automated || [
                      NotificationType.ABSENCE, NotificationType.LATE, NotificationType.GRADE_ALERT, 
                      NotificationType.ATTENDANCE_ALERT, NotificationType.FEE_REMINDER, NotificationType.FEE_OVERDUE
                    ].includes(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'group relative p-5 rounded-3xl border transition-all cursor-pointer shadow-sm',
                          isUnread
                            ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                            : 'bg-card hover:bg-muted/30 border-transparent'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <div
                            className={cn(
                              'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border',
                              priorityStyles[notification.priority].split(' ')[0],
                              priorityStyles[notification.priority].split(' ')[2]
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-6 w-6',
                                priorityStyles[notification.priority].split(' ')[1]
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn('font-black text-sm tracking-tight', isUnread ? 'text-primary' : 'text-slate-800')}>
                                {notification.title}
                              </p>
                              {isSmart && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-black uppercase tracking-tighter px-1.5 py-0">
                                  <Zap className="h-2 w-2 mr-0.5 fill-amber-500" /> {t('tabSmart')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                               <span>
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                               </span>
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isUnread && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(notification.id);
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete(notification.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-24 w-24 rounded-[40px] bg-muted/50 flex items-center justify-center mb-6">
                    <Bell className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-lg font-black text-slate-800">{t('empty')}</p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">
                    {activeTab === 'unread'
                      ? t('emptySubtitle')
                      : t('emptySubtitleGeneral')}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="px-8 py-6 border-t bg-muted/20">
          <Button variant="outline" size="sm" className="w-full h-12 rounded-2xl gap-3 font-black text-sm shadow-sm" asChild>
            <Link href="/dashboard/notifications/history">
              <Settings className="h-4 w-4" />
              {t('viewAll')}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

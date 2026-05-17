"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type LucideIcon,
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
  Zap,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { NotificationType, NotificationPriority } from "../types";
import type { Notification } from "../types";

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const typeIcons: Record<NotificationType, LucideIcon> = {
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

const priorityStyles: Record<string, string> = {
  [NotificationPriority.LOW]: "bg-info/10 text-info border-info/20",
  [NotificationPriority.MEDIUM]: "bg-warning/10 text-warning border-warning/20",
  // Backend may send 'normal' instead of 'medium'
  normal: "bg-warning/10 text-warning border-warning/20",
  [NotificationPriority.HIGH]: "bg-primary/10 text-primary border-primary/20",
  [NotificationPriority.URGENT]:
    "bg-destructive/10 text-destructive border-destructive/20",
};

// Safe lookup — falls back to 'low' styles if priority is unknown/undefined
const FALLBACK_PRIORITY_STYLE = "bg-muted/50 text-muted-foreground border-muted";
function getPriorityStyle(priority: string | undefined): string {
  return priorityStyles[priority ?? ""] ?? FALLBACK_PRIORITY_STYLE;
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const t = useTranslations("notifications.center");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read_at;
    if (activeTab === "smart")
      return (
        n.is_automated ||
        [
          NotificationType.ABSENCE,
          NotificationType.LATE,
          NotificationType.GRADE_ALERT,
          NotificationType.ATTENDANCE_ALERT,
          NotificationType.FEE_REMINDER,
          NotificationType.FEE_OVERDUE,
        ].includes(n.type)
      );
    return n.type === activeTab;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.open(notification.link, "_self");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-card bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="h-dvh max-h-dvh w-full gap-0 overflow-hidden border-l bg-card p-0 shadow-xl sm:max-w-md">
        <SheetHeader className="shrink-0 border-b bg-card px-6 py-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              {t("title")}
            </SheetTitle>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="h-9 gap-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <CheckCheck className="h-4 w-4" />
                  {t("markAllRead")}
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="min-h-0 flex-1 gap-0"
        >
          <TabsList className="mx-6 mt-5 grid h-auto w-auto grid-cols-4 rounded-lg bg-muted p-1">
            <TabsTrigger value="all" className="rounded-md text-xs font-medium">
              {t("tabAll")}
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="rounded-md text-xs font-medium"
            >
              {unreadCount > 0 && <span className="mr-1">{unreadCount}</span>}{" "}
              {t("tabUnread")}
            </TabsTrigger>
            <TabsTrigger
              value="smart"
              className="flex items-center gap-1 rounded-md text-xs font-medium"
            >
              <Zap className="h-3 w-3" /> {t("tabSmart")}
            </TabsTrigger>
            <TabsTrigger
              value="announcement"
              className="rounded-md text-xs font-medium"
            >
              {t("tabNews")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 min-h-0 flex-1">
            <ScrollArea className="h-full px-6">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-3 pb-8">
                  {filteredNotifications.map((notification) => {
                    const Icon = typeIcons[notification.type] || Bell;
                    const isUnread = !notification.read_at;
                    const isSmart =
                      notification.is_automated ||
                      [
                        NotificationType.ABSENCE,
                        NotificationType.LATE,
                        NotificationType.GRADE_ALERT,
                        NotificationType.ATTENDANCE_ALERT,
                        NotificationType.FEE_REMINDER,
                        NotificationType.FEE_OVERDUE,
                      ].includes(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "group relative cursor-pointer rounded-xl border p-4 transition-colors",
                          isUnread
                            ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                            : "border-border bg-card hover:bg-muted/40",
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                              getPriorityStyle(notification.priority).split(" ")[0],
                              getPriorityStyle(notification.priority).split(" ")[2],
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                getPriorityStyle(notification.priority).split(" ")[1],
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm font-semibold leading-snug",
                                  isUnread ? "text-primary" : "text-foreground",
                                )}
                              >
                                {notification.title}
                              </p>
                              {isSmart && (
                                <Badge
                                  variant="secondary"
                                  className="border-warning/20 bg-warning/10 px-1.5 py-0 text-[10px] font-medium text-warning hover:bg-warning/10"
                                >
                                  <Zap className="mr-0.5 h-2 w-2" />{" "}
                                  {t("tabSmart")}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(
                                  new Date(notification.created_at),
                                  { addSuffix: true },
                                )}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUnread && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
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
                                  className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
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
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                    <Bell className="h-9 w-9 text-muted-foreground/40" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {t("empty")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeTab === "unread"
                      ? t("emptySubtitle")
                      : t("emptySubtitleGeneral")}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t bg-card px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            className="h-11 w-full gap-3 rounded-md text-sm font-medium"
            asChild
          >
            <Link href="/dashboard/notifications/history">
              <Settings className="h-4 w-4" />
              {t("viewAll")}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

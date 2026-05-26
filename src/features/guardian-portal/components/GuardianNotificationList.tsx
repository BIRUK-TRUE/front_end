"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Calendar, 
  GraduationCap, 
  Wallet, 
  CheckCircle2,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import { 
  useGuardianNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead,
  useDeleteNotification 
} from "../hooks/useGuardianNotifications";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GuardianNotificationList() {
  const t = useTranslations("guardianPortal.notifications");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { data, isLoading } = useGuardianNotifications({ 
    type: filter === "all" ? undefined : filter,
    page: currentPage,
    size: ITEMS_PER_PAGE
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const notifications = data?.items || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "attendance": return <Calendar className="h-4 w-4" />;
      case "academic": return <GraduationCap className="h-4 w-4" />;
      case "fee_reminder": return <Wallet className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "attendance": return t("types.attendance");
      case "academic": return t("types.grades");
      case "fee_reminder": return t("types.fees");
      default: return t("types.general");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => markAllRead.mutate()} 
          disabled={notifications.length === 0 || notifications.every(n => n.isRead) || markAllRead.isPending}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t("markAllRead")}
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(val) => { setFilter(val); setCurrentPage(1); }} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="all">{t("filters.all")}</TabsTrigger>
          <TabsTrigger value="attendance">{t("filters.attendance")}</TabsTrigger>
          <TabsTrigger value="academic">{t("filters.grades")}</TabsTrigger>
          <TabsTrigger value="fee_reminder">{t("filters.fees")}</TabsTrigger>
          <TabsTrigger value="announcement">{t("filters.general")}</TabsTrigger>
        </TabsList>

        <Card className="shadow-sm border-muted/60">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground italic">{t("noNotifications")}</p>
              </div>
            ) : (
              <div className="divide-y divide-muted/60">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 flex gap-4 transition-colors hover:bg-muted/30 cursor-pointer",
                      !n.isRead && "bg-primary/[0.02] border-l-4 border-l-primary"
                    )}
                    onClick={() => !n.isRead && markRead.mutate(n.id)}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      n.type === "attendance" ? "bg-red-50 text-red-600" :
                      n.type === "academic" ? "bg-blue-50 text-blue-600" :
                      n.type === "fee_reminder" ? "bg-orange-50 text-orange-600" :
                      "bg-primary/10 text-primary"
                    )}>
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {getTypeLabel(n.type)}
                          </span>
                          {!n.isRead && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-primary">
                              {t("unread")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(n.createdAt), "MMM d, h:mm a")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification.mutate(n.id);
                            }}
                            disabled={deleteNotification.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-bold leading-none">{n.title}</p>
                      <p className="text-sm text-foreground/80 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground font-medium pt-1">
                         {t("student")}: <span className="text-primary">{n.studentName}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              {t("showing", { 
                start: ((currentPage - 1) * ITEMS_PER_PAGE) + 1, 
                end: Math.min(currentPage * ITEMS_PER_PAGE, data.total), 
                total: data.total 
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentPage} / {data.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(data.pages, p + 1))}
                disabled={currentPage === data.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { Plus, Pencil, GraduationCap, History, UserPlus, Bell, Loader2, X, Mail, Calendar, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthReady } from "@/hooks/use-auth-ready";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  user_name: string;
  timestamp: string;
  title?: string;
  status?: string;
  channel?: string;
  source?: "notification" | "admin_log";
  action?: string;
  resource_type?: string;
  metadata?: any;
}

interface ActivityDetail {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  channel: string;
  status: string;
  user_name: string;
  user_email?: string;
  timestamp: string;
  read_at?: string;
  sent_at?: string;
  source?: "notification" | "admin_log";
  metadata?: any;
}

export function ActivityFeed() {
  const t = useTranslations("dashboard");
  const authReady = useAuthReady();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: ["analytics", "recent-activity"],
    queryFn: async (): Promise<ActivityItem[]> => {
      const { data } = await axiosInstance.get("/analytics/recent-activity", {
        params: { limit: 20 },
      });
      return data.data || [];
    },
    enabled: authReady,
    refetchInterval: 60_000,
  });

  // Fetch detailed activity when one is selected
  const { data: activityDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["analytics", "recent-activity", "detail", selectedActivity],
    queryFn: async (): Promise<ActivityDetail> => {
      if (!selectedActivity) throw new Error("No activity selected");
      const { data } = await axiosInstance.get(`/analytics/recent-activity/${selectedActivity}`);
      return data;
    },
    enabled: !!selectedActivity,
  });

  // Mutation to mark activity/notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const getIconForType = (type: string, source?: string) => {
    // Admin log specific icons
    if (source === "admin_log") {
      switch (type?.toLowerCase()) {
        case "user":
          return <Pencil className="h-4 w-4 text-purple-500" />;
        case "system":
          return <Bell className="h-4 w-4 text-pink-500" />;
        default:
          return <History className="h-4 w-4 text-blue-500" />;
      }
    }
    
    // Notification specific icons
    switch (type?.toLowerCase()) {
      case "enrollment":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "grade":
      case "assessment":
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "attendance":
        return <History className="h-4 w-4 text-amber-500" />;
      case "payment":
        return <Pencil className="h-4 w-4 text-purple-500" />;
      case "system":
      case "notification":
        return <Plus className="h-4 w-4 text-pink-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "unread":
        return "default";
      case "read":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "default";
    }
  };

  const safeFormatDate = (dateStr: string | undefined, formatTemplate: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), formatTemplate);
    } catch (e) {
      return dateStr;
    }
  };

  const safeFormatDistance = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  return (
    <Card className="col-span-full lg:col-span-3 shadow-sm border">
      <CardHeader className="border-b pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and events across the school.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full rounded-md">
          {isPending ? (
            <div className="flex h-full min-h-[300px] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>Unable to load activity</p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {data.map((activity) => {
                const isUnread = activity.status === "unread";
                return (
                  <div
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivity(activity.id);
                      if (isUnread && activity.source === "notification") {
                        markAsRead(activity.id);
                      }
                    }}
                    className={cn(
                      "flex items-start gap-4 p-2.5 rounded-lg hover:bg-muted/60 transition-all cursor-pointer border border-transparent hover:border-muted relative group",
                      isUnread && "bg-primary/5 hover:bg-primary/10 border-primary/10"
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm relative">
                      {getIconForType(activity.type, activity.source)}
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-sm leading-tight transition-colors",
                          isUnread ? "font-semibold text-foreground" : "text-muted-foreground font-medium"
                        )}>
                          {activity.description}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {safeFormatDistance(activity.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-muted-foreground/80 mt-1">
                          By {activity.user_name || "System"}
                        </p>
                        {activity.source === "admin_log" && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">Admin Action</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activityDetail && getIconForType(activityDetail.notification_type, activityDetail.source)}
              Activity Details
            </DialogTitle>
            <DialogDescription>
              View complete information about this activity
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activityDetail ? (
            <div className="space-y-6">
              {/* Title and Type */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{activityDetail.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={getStatusColor(activityDetail.status)}>
                    {activityDetail.status}
                  </Badge>
                  <Badge variant="outline">{activityDetail.channel}</Badge>
                  <Badge variant="secondary">{activityDetail.notification_type}</Badge>
                  {activityDetail.source === "admin_log" && (
                    <Badge variant="default" className="bg-purple-500">Admin Log</Badge>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{activityDetail.message}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Performed by:</span>
                  </div>
                  <p className="text-sm pl-6">{activityDetail.user_name}</p>
                  {activityDetail.user_email && (
                    <div className="flex items-center gap-2 text-sm pl-6">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{activityDetail.user_email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Timestamp:</span>
                  </div>
                  <p className="text-sm pl-6">
                    {safeFormatDate(activityDetail.timestamp, "PPP pp")}
                  </p>
                  {activityDetail.read_at && (
                    <p className="text-xs pl-6 text-muted-foreground">
                      Read: {safeFormatDate(activityDetail.read_at, "PPP pp")}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Metadata */}
              {activityDetail.metadata && Object.keys(activityDetail.metadata).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Additional Information</h4>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(activityDetail.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedActivity(null)}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Failed to load activity details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

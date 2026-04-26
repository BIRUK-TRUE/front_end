"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Send,
  Bell,
  Mail,
  MessageSquare,
  Eye,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  useNotificationHistory,
  useNotificationDetail,
} from "@/features/notifications/api/useNotifications";
import type { NotificationHistory } from "@/features/notifications/types";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const t = useTranslations("notifications.history");
  const tc = useTranslations("common");

  const ALL_SELECT_VALUE = "all";

  const [filters, setFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
    channel: "",
    target: "",
  });

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationHistory | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: history, isLoading } = useNotificationHistory(filters);
  const { data: detail } = useNotificationDetail(
    selectedNotification?.id || "",
  );

  const handleViewDetails = (notification: NotificationHistory) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-slate-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "in_app":
        return <Bell className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            {t("compose")}
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Filter className="h-4 w-4" />
              {t("filters")}
            </div>

            <Select
              value={filters.type || ALL_SELECT_VALUE}
              onValueChange={(v) =>
                setFilters({
                  ...filters,
                  type: v === ALL_SELECT_VALUE ? "" : v,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filterType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SELECT_VALUE}>
                  {t("allTypes")}
                </SelectItem>
                <SelectItem value="absence_alert">
                  {t("types.absenceAlert")}
                </SelectItem>
                <SelectItem value="low_grade">{t("types.lowGrade")}</SelectItem>
                <SelectItem value="fee_reminder">
                  {t("types.feeReminder")}
                </SelectItem>
                <SelectItem value="general">{t("types.general")}</SelectItem>
                <SelectItem value="announcement">
                  {t("types.announcement")}
                </SelectItem>
                <SelectItem value="emergency">
                  {t("types.emergency")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-[160px]"
            />

            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-[160px]"
            />

            <Select
              value={filters.channel || ALL_SELECT_VALUE}
              onValueChange={(v) =>
                setFilters({
                  ...filters,
                  channel: v === ALL_SELECT_VALUE ? "" : v,
                })
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("filterChannel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SELECT_VALUE}>
                  {t("allChannels")}
                </SelectItem>
                <SelectItem value="in_app">{t("channels.inApp")}</SelectItem>
                <SelectItem value="sms">{t("channels.sms")}</SelectItem>
                <SelectItem value="email">{t("channels.email")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  type: "",
                  dateFrom: "",
                  dateTo: "",
                  channel: "",
                  target: "",
                })
              }
            >
              {t("clearFilters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.title")}</TableHead>
                <TableHead>{t("table.message")}</TableHead>
                <TableHead>{t("table.priority")}</TableHead>
                <TableHead>{t("table.channels")}</TableHead>
                <TableHead>{t("table.target")}</TableHead>
                <TableHead>{t("table.sentBy")}</TableHead>
                <TableHead>{t("table.sentAt")}</TableHead>
                <TableHead>{t("table.recipients")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-r-transparent mx-auto" />
                  </TableCell>
                </TableRow>
              ) : history && history.length > 0 ? (
                history.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {t(`types.${notification.type}`)}
                        </Badge>
                        <span className="font-medium">
                          {notification.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {notification.message_preview}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getPriorityColor(
                          notification.priority as string,
                        )}
                      >
                        {t(`priorities.${notification.priority}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {["in_app", "sms", "email"].map((channel) => (
                          <div key={channel} className="p-1 rounded bg-muted">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.type === "automatic"
                        ? t("targets.all")
                        : t("targets.specific")}
                    </TableCell>
                    <TableCell>{notification.sent_by_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.sent_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">
                          {notification.recipient_count}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-green-600">
                          {notification.status.delivered}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(notification)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("noNotifications")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("detailTitle")}</DialogTitle>
            <DialogDescription>{t("detailDescription")}</DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-2">{detail.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {detail.full_message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    {t("detail.sentBy")}
                  </p>
                  <p className="text-sm">{detail.sent_by_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    {t("detail.sentAt")}
                  </p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(detail.sent_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {t("detail.recipients")}
                </p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {detail.recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-2 rounded bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {recipient.recipient_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {recipient.recipient_role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(recipient.status)}
                        <span className="text-xs text-muted-foreground">
                          {recipient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded bg-green-50 dark:bg-green-950/20">
                  <p className="text-2xl font-bold text-green-600">
                    {detail.status.delivered}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("detail.delivered")}
                  </p>
                </div>
                <div className="text-center p-3 rounded bg-yellow-50 dark:bg-yellow-950/20">
                  <p className="text-2xl font-bold text-yellow-600">
                    {detail.status.pending}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("detail.pending")}
                  </p>
                </div>
                <div className="text-center p-3 rounded bg-red-50 dark:bg-red-950/20">
                  <p className="text-2xl font-bold text-red-600">
                    {detail.status.failed}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("detail.failed")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

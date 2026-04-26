"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  AlertCircle,
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Megaphone,
  RefreshCcw,
  User,
  Users,
  Wallet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useNotificationDetail,
  useRetryFailed,
} from "../api/useNotificationHistory";

interface NotificationHistoryDetailProps {
  notificationId: string | null;
  onClose: () => void;
}

type RecipientStatus = "delivered" | "pending" | "failed";

export function NotificationHistoryDetail({
  notificationId,
  onClose,
}: NotificationHistoryDetailProps) {
  const t = useTranslations("notifications.history");
  const tc = useTranslations("common");
  const { data: detail, isLoading } = useNotificationDetail(
    notificationId || "",
  );
  const retryFailed = useRetryFailed();

  if (!notificationId) {
    return null;
  }

  const renderNotificationIcon = () => {
    const className = "h-5 w-5";

    if (!detail) {
      return <Bell className={className} aria-hidden="true" />;
    }

    const title = detail.title.toLowerCase();
    const message = detail.full_message.toLowerCase();

    if (
      title.includes("grade") ||
      title.includes("result") ||
      message.includes("grade")
    ) {
      return <GraduationCap className={className} aria-hidden="true" />;
    }

    if (
      title.includes("attendance") ||
      title.includes("absent") ||
      title.includes("late") ||
      message.includes("attendance")
    ) {
      return <Clock className={className} aria-hidden="true" />;
    }

    if (
      title.includes("fee") ||
      title.includes("payment") ||
      title.includes("overdue") ||
      message.includes("fee")
    ) {
      return <Wallet className={className} aria-hidden="true" />;
    }

    if (title.includes("announcement") || title.includes("news")) {
      return <Megaphone className={className} aria-hidden="true" />;
    }

    if (detail.type === "automatic") {
      return <Bot className={className} aria-hidden="true" />;
    }

    return <Bell className={className} aria-hidden="true" />;
  };

  const renderStatusIcon = (status: RecipientStatus) => {
    const className = "h-3.5 w-3.5";

    switch (status) {
      case "delivered":
        return <CheckCircle2 className={className} aria-hidden="true" />;
      case "pending":
        return <Clock className={className} aria-hidden="true" />;
      case "failed":
        return <AlertCircle className={className} aria-hidden="true" />;
      default:
        return <Clock className={className} aria-hidden="true" />;
    }
  };

  const getStatusLabel = (status: RecipientStatus) => {
    switch (status) {
      case "delivered":
        return t("detail.delivered");
      case "pending":
        return t("detail.pending");
      case "failed":
        return t("detail.failed");
      default:
        return status;
    }
  };

  const getStatusClassName = (status: RecipientStatus) => {
    switch (status) {
      case "delivered":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeLabel = (type: string) => {
    const key = `types.${type}`;

    if (t.has(key)) {
      return t(key);
    }

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const retryLabel = t.has("detail.retryFailed")
    ? t("detail.retryFailed")
    : t("detail.failed");

  return (
    <Dialog open={!!notificationId} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {renderNotificationIcon()}
            </div>

            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                {t("detailTitle")}
              </DialogTitle>

              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {detail?.sent_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {format(new Date(detail.sent_at), "yyyy-MM-dd HH:mm")}
                  </span>
                )}

                {detail?.sent_by_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    {detail.sent_by_name}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">{tc("loading")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("table.message")}
                  </h3>

                  {detail?.type && (
                    <Badge variant="secondary" className="gap-1.5">
                      {detail.type === "automatic" ? (
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {getTypeLabel(detail.type)}
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg border bg-card p-5">
                  <p className="font-medium text-foreground">{detail?.title}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {detail?.full_message}
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Users
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    {t("detail.recipients")}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="border-success/20 bg-success/10 text-success"
                    >
                      {detail?.status.delivered ?? 0} {t("detail.delivered")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-warning/20 bg-warning/10 text-warning"
                    >
                      {detail?.status.pending ?? 0} {t("detail.pending")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      {detail?.status.failed ?? 0} {t("detail.failed")}
                    </Badge>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-card">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">
                            {t("table.recipient")}
                          </TableHead>
                          <TableHead>{t("table.status")}</TableHead>
                          <TableHead className="pr-6 text-right">
                            {t("table.sentAt")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {detail?.recipients.map((recipient) => {
                          const status = recipient.status as RecipientStatus;

                          return (
                            <TableRow key={recipient.id}>
                              <TableCell className="pl-6 align-top">
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">
                                    {recipient.recipient_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {recipient.recipient_role}
                                  </p>
                                </div>
                              </TableCell>

                              <TableCell className="align-top">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "gap-1.5 font-medium",
                                    getStatusClassName(status),
                                  )}
                                >
                                  {renderStatusIcon(status)}
                                  {getStatusLabel(status)}
                                </Badge>
                              </TableCell>

                              <TableCell className="pr-6 text-right align-top">
                                {recipient.delivered_at ? (
                                  <span className="text-sm text-muted-foreground">
                                    {format(
                                      new Date(recipient.delivered_at),
                                      "yyyy-MM-dd HH:mm",
                                    )}
                                  </span>
                                ) : recipient.error_message ? (
                                  <span className="inline-block max-w-[220px] truncate text-sm text-destructive">
                                    {recipient.error_message}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            {tc("close")}
          </Button>

          <Button
            className="gap-2"
            disabled={
              !detail || detail.status.failed === 0 || retryFailed.isPending
            }
            onClick={() => detail && retryFailed.mutate(detail.id)}
          >
            {retryFailed.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            )}
            {retryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

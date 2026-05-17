"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  History,
  ArrowRight,
} from "lucide-react";
import {
  useNotificationHistory,
  useNotificationDetail,
} from "@/features/notifications/api/useNotifications";
import type { NotificationHistory } from "@/features/notifications/types";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";

// ── Quick-action cards ────────────────────────────────────────────────────────

function NotificationHub() {
  const actions = [
    {
      icon: <Send className="h-6 w-6 text-primary" />,
      title: "Send a Message",
      description: "Compose and send a notification to students, guardians, or staff.",
      href: "/dashboard/notifications/compose",
      cta: "Compose",
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-amber-600" />,
      title: "Alert Rules",
      description: "Set up automatic alerts for absences, low grades, or overdue fees.",
      href: "/dashboard/notifications/alert-rules",
      cta: "Manage Rules",
    },
    {
      icon: <History className="h-6 w-6 text-muted-foreground" />,
      title: "Sent History",
      description: "View all previously sent notifications and their delivery status.",
      href: "#history",
      cta: "View History",
      isTab: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((a) =>
        a.isTab ? (
          <Card key={a.title} className="group hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-5 flex flex-col gap-3 h-full">
              <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
                {a.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{a.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.description}</p>
              </div>
              <Button variant="ghost" size="sm" className="justify-start gap-2 px-0 text-muted-foreground group-hover:text-foreground">
                {a.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Link key={a.title} href={a.href}>
            <Card className="group hover:border-primary/40 transition-colors cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  {a.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="justify-start gap-2 px-0 text-primary group-hover:underline">
                  {a.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        )
      )}
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab() {
  const ALL = "all";
  const [filters, setFilters] = useState({ type: "", dateFrom: "", dateTo: "", channel: "" });
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistory | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: history, isLoading } = useNotificationHistory(filters);
  const { data: detail } = useNotificationDetail(selectedNotification?.id || "");

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      urgent: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-blue-500 text-white",
      low: "bg-slate-400 text-white",
    };
    return map[priority] ?? "bg-slate-400 text-white";
  };

  const getChannelIcon = (channel: string) => {
    if (channel === "in_app") return <Bell className="h-3.5 w-3.5" />;
    if (channel === "sms") return <MessageSquare className="h-3.5 w-3.5" />;
    if (channel === "email") return <Mail className="h-3.5 w-3.5" />;
    return null;
  };

  const getStatusIcon = (status: string) => {
    if (status === "delivered") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-amber-500" />;
    if (status === "failed") return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const hasFilters = filters.type || filters.dateFrom || filters.dateTo || filters.channel;

  return (
    <>
      {/* Filter bar */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Filter by:
            </div>

            <Select
              value={filters.type || ALL}
              onValueChange={(v) => setFilters({ ...filters, type: v === ALL ? "" : v })}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All types</SelectItem>
                <SelectItem value="absence_alert">Absence Alert</SelectItem>
                <SelectItem value="low_grade">Low Grade</SelectItem>
                <SelectItem value="fee_reminder">Fee Reminder</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.channel || ALL}
              onValueChange={(v) => setFilters({ ...filters, channel: v === ALL ? "" : v })}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All channels</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-[140px] h-9"
                aria-label="From date"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-[140px] h-9"
                aria-label="To date"
              />
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ type: "", dateFrom: "", dateTo: "", channel: "" })}
                className="text-muted-foreground h-9"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Sent by</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead className="sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="animate-spin h-6 w-6 rounded-full border-4 border-primary border-r-transparent mx-auto" />
                  </TableCell>
                </TableRow>
              ) : history && history.length > 0 ? (
                history.map((n) => (
                  <TableRow key={n.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {n.message_preview}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${getPriorityColor(n.priority as string)}`}>
                        {n.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {["in_app", "sms", "email"].map((ch) => (
                          <div key={ch} className="p-1 rounded bg-muted text-muted-foreground">
                            {getChannelIcon(ch)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{n.sent_by_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.sent_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{n.recipient_count}</span>
                        <span className="text-muted-foreground"> · </span>
                        <span className="text-emerald-600">{n.status.delivered} delivered</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedNotification(n); setIsDetailOpen(true); }}
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                    No notifications sent yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>Full message and delivery status.</DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-5 py-2">
              <div>
                <h3 className="font-semibold mb-1">{detail.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.full_message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Sent by</p>
                  <p>{detail.sent_by_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Sent</p>
                  <p>{formatDistanceToNow(new Date(detail.sent_at), { addSuffix: true })}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Delivered", count: detail.status.delivered, color: "emerald" },
                  { label: "Pending", count: detail.status.pending, color: "amber" },
                  { label: "Failed", count: detail.status.failed, color: "red" },
                ].map(({ label, count, color }) => (
                  <div key={label} className={`text-center p-3 rounded-lg bg-${color}-50 dark:bg-${color}-950/20`}>
                    <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recipients</p>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {detail.recipients.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.recipient_name}</p>
                          <p className="text-xs text-muted-foreground">{r.recipient_role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(r.status)}
                        <span className="text-xs text-muted-foreground">{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        description="Send messages, manage alert rules, and review delivery history."
        actions={
          <Link href="/dashboard/notifications/compose">
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Sent History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <NotificationHub />
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

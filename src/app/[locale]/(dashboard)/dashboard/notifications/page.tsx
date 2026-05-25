"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle2, Clock, Edit3, Inbox, Mail, MessageSquare, Search, Send, Trash2, Users, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationHistory } from "@/features/notifications/api/useNotifications";
import type { NotificationHistory } from "@/features/notifications/types";

const folders = [
  { label: "Inbox", icon: Inbox, count: 12 },
  { label: "Sent", icon: Send, count: 0 },
  { label: "Drafts", icon: Edit3, count: 2 },
  { label: "Broadcast", icon: Bell, count: 0 },
  { label: "Trash", icon: Trash2, count: 0 },
];

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "sms") return <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />;
  if (channel === "email") return <Mail className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Bell className="h-3.5 w-3.5" aria-hidden="true" />;
}

function DeliveryStatus({ status }: { status: { delivered: number; pending: number; failed: number } }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" />{status.delivered} delivered</span>
      <span className="flex items-center gap-1 text-warning"><Clock className="h-3.5 w-3.5" />{status.pending} pending</span>
      <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" />{status.failed} failed</span>
    </div>
  );
}

function ComposeSheet() {
  const [recipientMode, setRecipientMode] = useState("all_guardians");
  const [channels, setChannels] = useState(["in_app", "email"]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="min-h-11 gap-2">
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Compose Message
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b p-6 text-left">
          <SheetTitle>Compose Message</SheetTitle>
          <SheetDescription>Send a clear, targeted message to students, staff, or guardians.</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 p-6">
          <section className="space-y-3">
            <h3>Recipients</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["all_students", "All Students"],
                ["all_teachers", "All Teachers"],
                ["all_guardians", "All Guardians"],
                ["by_grade", "By Grade"],
              ].map(([value, label]) => (
                <Button key={value} type="button" variant={recipientMode === value ? "default" : "outline"} className="justify-start" onClick={() => setRecipientMode(value)}>
                  <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
            <Badge variant="outline" className="rounded-full">Sending to 247 recipients</Badge>
          </section>

          <section className="space-y-4">
            <h3>Message</h3>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select defaultValue="general">
                <SelectTrigger id="template"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee">Fee Reminder</SelectItem>
                  <SelectItem value="attendance">Attendance Alert</SelectItem>
                  <SelectItem value="event">Event Notice</SelectItem>
                  <SelectItem value="exam">Exam Schedule</SelectItem>
                  <SelectItem value="emergency">Emergency Notice</SelectItem>
                  <SelectItem value="general">General Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={8} />
              <p className="text-xs text-muted-foreground">0 words</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3>Delivery</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["in_app", "In-App", Bell],
                ["email", "Email", Mail],
                ["sms", "SMS", MessageSquare],
              ].map(([value, label, Icon]) => (
                <label key={value as string} className="flex min-h-11 items-center gap-2 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={channels.includes(value as string)}
                    onCheckedChange={(checked) => setChannels((current) => checked ? [...current, value as string] : current.filter((channel) => channel !== value))}
                  />
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label as string}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-muted/40 p-4">
            <h3>Preview</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your message preview will appear here before sending.</p>
          </section>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Save Draft</Button>
            <Button>Send Now</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NotificationHistory | null>(null);
  const { data: history, isLoading } = useNotificationHistory({});

  const messages = useMemo(() => {
    return (history || []).filter((message) => {
      const query = search.toLowerCase();
      return !query || message.title.toLowerCase().includes(query) || message.message_preview.toLowerCase().includes(query);
    });
  }, [history, search]);

  const activeMessage = selected || messages[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messaging"
        description="Compose, send, and audit school communication from one familiar workspace."
        icon={MessageSquare}
        breadcrumb={["Admin", "Communication", "Messaging"]}
        action={<ComposeSheet />}
      />

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="grid min-h-[640px] p-0 lg:grid-cols-[220px_minmax(300px,0.9fr)_minmax(360px,1.1fr)]">
          <aside className="border-b bg-muted/30 p-4 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folders</p>
            <nav className="space-y-1" aria-label="Message folders">
              {folders.map(({ label, icon: Icon, count }, index) => (
                <button
                  key={label}
                  className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted ${index === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                >
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden="true" />{label}</span>
                  {count > 0 && <Badge variant="secondary" className="rounded-full">{count}</Badge>}
                </button>
              ))}
            </nav>

            <Separator className="my-5" />

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Send</p>
            <div className="space-y-1">
              {["All Students", "All Teachers", "All Guardians", "By Grade"].map((label) => (
                <Button key={label} variant="ghost" className="min-h-11 w-full justify-start text-muted-foreground">{label}</Button>
              ))}
            </div>
          </aside>

          <section className="border-b lg:border-b-0 lg:border-r">
            <div className="border-b p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages..." className="pl-9" />
              </div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2 p-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelected(message)}
                    className={`w-full border-l-2 p-4 text-left transition-colors hover:bg-muted/60 ${activeMessage?.id === message.id ? "border-primary bg-primary/5" : "border-transparent"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{message.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{message.message_preview}</p>
                      </div>
                      {message.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}</span>
                      <span>{message.recipient_count} recipients</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No messages match your filters.</div>
              )}
            </div>
          </section>

          <section className="p-6">
            {activeMessage ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2>{activeMessage.title}</h2>
                    <Badge variant={activeMessage.priority === "urgent" ? "destructive" : "secondary"}>{activeMessage.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sent by {activeMessage.sent_by_name} {formatDistanceToNow(new Date(activeMessage.sent_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["in_app", "email", "sms"].map((channel) => (
                    <Badge key={channel} variant="outline" className="gap-1.5 rounded-full">
                      <ChannelIcon channel={channel} />
                      {channel.replace("_", "-")}
                    </Badge>
                  ))}
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">{activeMessage.message_preview}</p>
                </div>

                <DeliveryStatus status={activeMessage.status} />

                <div className="grid gap-3 sm:grid-cols-3">
                  <StatusBadge status="paid" label={`${activeMessage.status.delivered} delivered`} />
                  <StatusBadge status="late" label={`${activeMessage.status.pending} pending`} />
                  <StatusBadge status="overdue" label={`${activeMessage.status.failed} failed`} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">Mark read</Button>
                  <Button variant="outline">Forward</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                Click a message to preview it here.
              </div>
            )}
          </section>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/dashboard/notifications/compose" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Open advanced composer
        </Link>
      </div>
    </div>
  );
}

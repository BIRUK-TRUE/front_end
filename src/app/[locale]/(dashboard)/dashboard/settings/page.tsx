"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle, Database, Mail, Palette, Phone, Save, Shield, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSchoolInfo, useUpdateSchoolInfo } from "@/hooks/use-settings";
import type { SchoolInfo } from "@/lib/api/settings.service";

const defaultSchoolForm: SchoolInfo = {
  school_name: "School Management System",
  address: "",
  phone: "",
  email: "",
  logo_url: null,
  school_logo: null,
  school_tagline: "",
  primary_color: "#2563EB",
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SM";
}

export default function SettingsPage() {
  const { data: schoolInfo, isLoading } = useSchoolInfo();
  const updateSchoolInfo = useUpdateSchoolInfo();
  const [draft, setDraft] = useState<Partial<SchoolInfo>>({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const form = useMemo<SchoolInfo>(() => ({
    ...defaultSchoolForm,
    ...schoolInfo,
    ...draft,
    school_logo: draft.school_logo ?? schoolInfo?.school_logo ?? schoolInfo?.logo_url ?? null,
    primary_color: draft.primary_color ?? schoolInfo?.primary_color ?? "#2563EB",
  }), [draft, schoolInfo]);

  const handleChange = (key: keyof SchoolInfo, value: string | null) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    updateSchoolInfo.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage school branding, communication defaults, and operational safeguards."
        icon={Shield}
        breadcrumb={["Admin", "System", "Settings"]}
        action={
          <Button onClick={handleSave} disabled={updateSchoolInfo.isPending} className="min-h-11 gap-2">
            <Save className="h-4 w-4" aria-hidden="true" />
            {updateSchoolInfo.isPending ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
              School Branding
            </CardTitle>
            <CardDescription>
              These values power the login page, report headers, and system-wide brand color.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-4" aria-busy="true">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="school-name">School Name</Label>
                    <Input id="school-name" value={form.school_name} onChange={(event) => handleChange("school_name", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-color">School Primary Color</Label>
                    <div className="flex gap-2">
                      <Input id="school-color" type="color" value={form.primary_color || "#2563EB"} onChange={(event) => handleChange("primary_color", event.target.value)} className="w-16 p-1" />
                      <Input value={form.primary_color || "#2563EB"} onChange={(event) => handleChange("primary_color", event.target.value)} aria-label="Primary color hex value" className="font-mono" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-logo">School Logo URL</Label>
                  <div className="flex gap-2">
                    <Input id="school-logo" value={form.school_logo || ""} onChange={(event) => handleChange("school_logo", event.target.value)} />
                    <Button type="button" variant="outline" className="min-h-11 gap-2">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Paste an image URL now; the upload control is ready for backend storage integration.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-tagline">School Tagline/Motto</Label>
                  <Textarea id="school-tagline" value={form.school_tagline || ""} onChange={(event) => handleChange("school_tagline", event.target.value)} rows={3} />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="school-address">School Address</Label>
                    <Input id="school-address" value={form.address || ""} onChange={(event) => handleChange("address", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-phone">Phone</Label>
                    <Input id="school-phone" value={form.phone || ""} onChange={(event) => handleChange("phone", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-email">Email</Label>
                    <Input id="school-email" type="email" value={form.email || ""} onChange={(event) => handleChange("email", event.target.value)} />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
              Login Preview
            </CardTitle>
            <CardDescription>Branding updates are reflected instantly in the sign-in experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border bg-muted/40 p-6 flex justify-center items-center relative">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[40px]" style={{ backgroundColor: form.primary_color || "#2563EB" }} />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full opacity-10 blur-[40px]" style={{ backgroundColor: form.primary_color || "#2563EB" }} />
              </div>

              {/* Card Preview */}
              <div className="relative w-full max-w-[300px] rounded-xl border bg-card text-card-foreground shadow-lg">
                <div className="flex flex-col space-y-3 items-center text-center p-5 pb-4">
                  <Avatar className="h-14 w-14 rounded-xl border-2 border-primary/20 shadow-sm ring-1 ring-border">
                    <AvatarImage src={form.school_logo || undefined} alt={`${form.school_name} logo`} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">
                      {initials(form.school_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-bold tracking-tight text-lg leading-tight break-words">
                      Welcome to <br />
                      <span style={{ color: form.primary_color || "#2563EB" }}>{form.school_name || "School Management"}</span>
                    </h3>
                    {form.school_tagline && (
                      <p className="text-[10px] font-medium italic text-muted-foreground px-2">
                        "{form.school_tagline}"
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground pt-1">Sign in to your account to continue</p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <Skeleton className="h-3 w-3 rounded-sm" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Button className="w-full h-9 text-xs" style={{ backgroundColor: form.primary_color || "#2563EB", color: "#fff" }}>
                    Sign In →
                  </Button>
                </div>

                <div className="border-t bg-muted/20 px-4 py-3 text-center">
                  <p className="text-[9px] text-muted-foreground">
                    Secure access · All roles auto-detected
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Operational controls for administrators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="maintenance-mode" className="text-sm font-medium">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Temporarily pause regular access during planned work.</p>
              </div>
              <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            <StatusBadge status={maintenanceMode ? "late" : "active"} label={maintenanceMode ? "Maintenance enabled" : "System operational"} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Communication Defaults</CardTitle>
            <CardDescription>Shared notification preferences for school messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Use email for announcements and reminders.</p>
                </div>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <Phone className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="font-medium">SMS</p>
                <p className="text-xs text-muted-foreground">Ready for provider configuration.</p>
              </div>
              <div className="rounded-lg border p-4">
                <Database className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="font-medium">Backups</p>
                <p className="text-xs text-muted-foreground">Last backup: pending configuration.</p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              Settings use optimistic updates and success toasts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

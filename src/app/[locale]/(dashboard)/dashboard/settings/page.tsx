"use client";

import { useTranslations } from "next-intl";
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
import { 
  useSchoolInfo, 
  useUpdateSchoolInfo,
  useMaintenanceMode,
  useSetMaintenanceMode,
  useNotificationSettings,
  useUpdateNotificationSettings
} from "@/hooks/use-settings";
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
  const t = useTranslations("settingsPage");
  const ts = useTranslations("settings");
  const tg = useTranslations("settingsPage.general");
  const { data: schoolInfo, isLoading } = useSchoolInfo();
  const updateSchoolInfo = useUpdateSchoolInfo();
  const { data: maintenanceData } = useMaintenanceMode();
  const setMaintenance = useSetMaintenanceMode();
  const { data: notificationSettings } = useNotificationSettings();
  const updateNotifications = useUpdateNotificationSettings();
  const [draft, setDraft] = useState<Partial<SchoolInfo>>({});

  const maintenanceMode = maintenanceData?.maintenance_mode ?? false;
  const emailNotifications = notificationSettings?.email_notifications_enabled ?? true;

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
        title={t("title")}
        description={t("pageDescription")}
        icon={Shield}
        action={
          <Button onClick={handleSave} disabled={updateSchoolInfo.isPending} className="min-h-11 gap-2">
            <Save className="h-4 w-4" aria-hidden="true" />
            {updateSchoolInfo.isPending ? t("saving") : tg("saveChanges")}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("branding.title")}
            </CardTitle>
            <CardDescription>{t("branding.description")}</CardDescription>
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
                    <Label htmlFor="school-name">{tg("schoolName")}</Label>
                    <Input id="school-name" value={form.school_name} onChange={(event) => handleChange("school_name", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-color">{t("branding.primaryColor")}</Label>
                    <div className="flex gap-2">
                      <Input id="school-color" type="color" value={form.primary_color || "#2563EB"} onChange={(event) => handleChange("primary_color", event.target.value)} className="w-16 p-1" />
                      <Input value={form.primary_color || "#2563EB"} onChange={(event) => handleChange("primary_color", event.target.value)} aria-label={t("branding.primaryColorAria")} className="font-mono" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-logo">{t("branding.logoUrl")}</Label>
                  <div className="flex gap-2">
                    <Input id="school-logo" value={form.school_logo || ""} onChange={(event) => handleChange("school_logo", event.target.value)} />
                    <Button type="button" variant="outline" className="min-h-11 gap-2">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      {t("branding.upload")}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("branding.logoHint")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-tagline">{t("branding.tagline")}</Label>
                  <Textarea id="school-tagline" value={form.school_tagline || ""} onChange={(event) => handleChange("school_tagline", event.target.value)} rows={3} />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="school-address">{tg("address")}</Label>
                    <Input id="school-address" value={form.address || ""} onChange={(event) => handleChange("address", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-phone">{tg("phone")}</Label>
                    <Input id="school-phone" value={form.phone || ""} onChange={(event) => handleChange("phone", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-email">{tg("email")}</Label>
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
              {t("loginPreview.title")}
            </CardTitle>
            <CardDescription>{t("loginPreview.description")}</CardDescription>
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
                      {t("loginPreview.welcomeTo")} <br />
                      <span style={{ color: form.primary_color || "#2563EB" }}>{form.school_name || t("loginPreview.defaultSchoolName")}</span>
                    </h3>
                    {form.school_tagline && (
                      <p className="text-[10px] font-medium italic text-muted-foreground px-2">
                        "{form.school_tagline}"
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground pt-1">{t("loginPreview.signInPrompt")}</p>
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
                    {t("loginPreview.signIn")}
                  </Button>
                </div>

                <div className="border-t bg-muted/20 px-4 py-3 text-center">
                  <p className="text-[9px] text-muted-foreground">
                    {t("loginPreview.footer")}
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
            <CardTitle>{ts("systemStatus")}</CardTitle>
            <CardDescription>{ts("systemStatusDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="maintenance-mode" className="text-sm font-medium">{ts("maintenanceMode")}</Label>
                <p className="text-xs text-muted-foreground">{t("operational.maintenancePauseDesc")}</p>
              </div>
              <Switch 
                id="maintenance-mode" 
                checked={maintenanceMode} 
                onCheckedChange={(checked) => setMaintenance.mutate(checked)}
                disabled={setMaintenance.isPending}
              />
            </div>
            <StatusBadge status={maintenanceMode ? "late" : "active"} label={maintenanceMode ? t("operational.maintenanceEnabled") : t("operational.systemOperational")} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{ts("notificationSettings")}</CardTitle>
            <CardDescription>{ts("notificationSettingsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">{ts("emailNotifications")}</Label>
                  <p className="text-xs text-muted-foreground">{ts("emailNotificationsDescription")}</p>
                </div>
              </div>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications} 
                onCheckedChange={(checked) => updateNotifications.mutate({ email_notifications_enabled: checked })}
                disabled={updateNotifications.isPending}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <Phone className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="font-medium">{ts("smsNotifications")}</p>
                <p className="text-xs text-muted-foreground">{t("operational.smsReady")}</p>
              </div>
              <div className="rounded-lg border p-4">
                <Database className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="font-medium">{ts("backupSettings")}</p>
                <p className="text-xs text-muted-foreground">{t("operational.backupsPending")}</p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              {t("operational.optimisticNote")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

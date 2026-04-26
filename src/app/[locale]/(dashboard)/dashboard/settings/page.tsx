'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Bell, Shield, Palette, Building, ScanFace, BookOpen, Save, RotateCcw, Upload, X, Loader2 } from 'lucide-react';
import { useSchoolInfo, useAcademicSettings, useNotificationSettings, useUpdateSchoolInfo, useUpdateAcademicSettings, useUpdateNotificationSettings } from '@/hooks/use-settings';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';

const MONTHS = [
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
];

// School Info Schema
const schoolInfoSchema = z.object({
  school_name: z.string().min(1, 'School name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  region: z.string().optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
});

type SchoolInfoForm = z.infer<typeof schoolInfoSchema>;

// Academic Settings Schema
const academicSettingsSchema = z.object({
  grading_scale: z.record(z.string(), z.number()),
  attendance_warning_threshold: z.number().min(50).max(100),
  confidence_threshold: z.number().min(50).max(100),
});

type AcademicSettingsForm = z.infer<typeof academicSettingsSchema>;

// Notification Settings Schema
const notificationSettingsSchema = z.object({
  absence_alert: z.boolean(),
  low_grade_alert: z.boolean(),
  fee_reminder: z.boolean(),
  consecutive_absence_threshold: z.number().min(1),
});

type NotificationSettingsForm = z.infer<typeof notificationSettingsSchema>;

function SettingsPage() {
  const tc = useTranslations('common');
  const ts = useTranslations('settingsPage');
  const { canManageSettings } = usePermissions();
  
  // Appearance settings (localStorage)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [dateFormat, setDateFormat] = useState<'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'>('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    const storedLanguage = localStorage.getItem('language') as 'en' | 'am' || 'en';
    const storedDateFormat = localStorage.getItem('dateFormat') as any || 'DD/MM/YYYY';
    const storedTimeFormat = localStorage.getItem('timeFormat') as any || '24h';
    setTheme(storedTheme);
    setLanguage(storedLanguage);
    setDateFormat(storedDateFormat);
    setTimeFormat(storedTimeFormat);
  }, []);

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    localStorage.setItem('theme', value);
    toast.success(ts('settingsSaved'));
  };

  const handleLanguageChange = (value: 'en' | 'am') => {
    setLanguage(value);
    localStorage.setItem('language', value);
    toast.success(ts('settingsSaved'));
    // Navigate to change locale
    window.location.href = `/${value}/dashboard/settings`;
  };

  const handleDateFormatChange = (value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => {
    setDateFormat(value);
    localStorage.setItem('dateFormat', value);
    toast.success(ts('settingsSaved'));
  };

  const handleTimeFormatChange = (value: '12h' | '24h') => {
    setTimeFormat(value);
    localStorage.setItem('timeFormat', value);
    toast.success(ts('settingsSaved'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tc('settings')}
        description={ts('description')}
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="general" className="gap-2">
            <Building className="h-4 w-4" /> {ts('tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-2">
            <BookOpen className="h-4 w-4" /> {ts('tabs.academic')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> {ts('tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> {ts('tabs.appearance')}
          </TabsTrigger>
          {canManageSettings && (
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" /> {ts('tabs.security')}
            </TabsTrigger>
          )}
          <TabsTrigger value="attendance" className="gap-2">
            <ScanFace className="h-4 w-4" /> {ts('tabs.attendance')}
          </TabsTrigger>
        </TabsList>

        <SchoolInfoTab />
        <AcademicTab />
        <NotificationsTab />
        <AppearanceTab
          theme={theme}
          onThemeChange={handleThemeChange}
          language={language}
          onLanguageChange={handleLanguageChange}
          dateFormat={dateFormat}
          onDateFormatChange={handleDateFormatChange}
          timeFormat={timeFormat}
          onTimeFormatChange={handleTimeFormatChange}
        />
        {canManageSettings && <SecurityTab />}
        <AttendanceTab />
      </Tabs>
    </div>
  );
}

function SchoolInfoTab() {
  const ts = useTranslations('settingsPage');
  const tc = useTranslations('common');
  const { data: schoolInfo, isLoading } = useSchoolInfo();
  const updateSchoolInfo = useUpdateSchoolInfo();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SchoolInfoForm>({
    resolver: zodResolver(schoolInfoSchema),
  });

  useEffect(() => {
    if (schoolInfo) {
      reset({
        school_name: schoolInfo.school_name || '',
        address: schoolInfo.address || '',
        phone: schoolInfo.phone || '',
        email: schoolInfo.email || '',
        website: schoolInfo.website || '',
        region: schoolInfo.region || '',
        zone: schoolInfo.zone || '',
        woreda: schoolInfo.woreda || '',
      });
    }
  }, [schoolInfo, reset]);

  const onSubmit = (data: SchoolInfoForm) => {
    updateSchoolInfo.mutate(data);
  };

  const handleReset = () => {
    if (schoolInfo) {
      reset({
        school_name: schoolInfo.school_name || '',
        address: schoolInfo.address || '',
        phone: schoolInfo.phone || '',
        email: schoolInfo.email || '',
        website: schoolInfo.website || '',
        region: schoolInfo.region || '',
        zone: schoolInfo.zone || '',
        woreda: schoolInfo.woreda || '',
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;

  return (
    <TabsContent value="general">
      <Card>
        <CardHeader>
          <CardTitle>{ts('general.title')}</CardTitle>
          <CardDescription>{ts('general.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="school_name">{ts('general.schoolName')} *</Label>
              <Input id="school_name" {...register('school_name')} aria-invalid={!!errors.school_name} className="h-11" />
              {errors.school_name && <p className="text-sm text-destructive">{errors.school_name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="school_code">{ts('general.schoolCode')}</Label>
              <Input id="school_code" value={schoolInfo?.school_code || ''} disabled className="h-11 bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{ts('general.address')} *</Label>
              <Textarea id="address" {...register('address')} aria-invalid={!!errors.address} className="h-24" />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{ts('general.phone')} *</Label>
                <Input id="phone" {...register('phone')} aria-invalid={!!errors.phone} className="h-11" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{ts('general.email')} *</Label>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} className="h-11" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">{ts('general.website')}</Label>
              <Input id="website" {...register('website')} aria-invalid={!!errors.website} className="h-11" />
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="region">{ts('general.region')}</Label>
                <Input id="region" {...register('region')} className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zone">{ts('general.zone')}</Label>
                <Input id="zone" {...register('zone')} className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="woreda">{ts('general.woreda')}</Label>
                <Input id="woreda" {...register('woreda')} className="h-11" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="gap-2 min-h-[44px]" disabled={!isDirty || updateSchoolInfo.isPending}>
                {updateSchoolInfo.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />{tc('loading')}</> : <><Save className="h-4 w-4" />{ts('general.saveChanges')}</>}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2 min-h-[44px]" disabled={!isDirty}>
                <RotateCcw className="h-4 w-4" /> {ts('resetToDefaults')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function AcademicTab() {
  const ts = useTranslations('settingsPage');
  const tc = useTranslations('common');
  const { data: academicSettings, isLoading } = useAcademicSettings();
  const updateAcademicSettings = useUpdateAcademicSettings();
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<AcademicSettingsForm>({
    resolver: zodResolver(academicSettingsSchema),
    defaultValues: {
      grading_scale: { A: 90, B: 80, C: 70, D: 60 },
      attendance_warning_threshold: 75,
      confidence_threshold: 80,
    },
  });

  const gradingScale = watch('grading_scale');

  useEffect(() => {
    if (academicSettings) {
      reset({
        grading_scale: academicSettings.grading_scale || { A: 90, B: 80, C: 70, D: 60 },
        attendance_warning_threshold: academicSettings.attendance_warning_threshold || 75,
        confidence_threshold: academicSettings.confidence_threshold || 80,
      });
    }
  }, [academicSettings, reset]);

  const onSubmit = (data: AcademicSettingsForm) => {
    updateAcademicSettings.mutate(data);
  };

  const handleReset = () => {
    reset({
      grading_scale: { A: 90, B: 80, C: 70, D: 60 },
      attendance_warning_threshold: 75,
      confidence_threshold: 80,
    });
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;

  return (
    <TabsContent value="academic">
      <Card>
        <CardHeader>
          <CardTitle>{ts('academic.title')}</CardTitle>
          <CardDescription>{ts('academic.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Label>{ts('academic.gradingScale')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['A', 'B', 'C', 'D'].map((grade) => (
                  <div key={grade} className="space-y-2">
                    <Label htmlFor={`grade_${grade}`}>{ts(`academic.grade${grade}`)}</Label>
                    <Input
                      id={`grade_${grade}`}
                      type="number"
                      min={0}
                      max={100}
                      {...register(`grading_scale.${grade}` as any, { valueAsNumber: true })}
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="attendance_threshold">{ts('academic.attendanceThreshold')}</Label>
                <span className="text-sm text-muted-foreground">{watch('attendance_warning_threshold')}%</span>
              </div>
              <Slider
                id="attendance_threshold"
                min={50}
                max={100}
                step={1}
                value={[watch('attendance_warning_threshold')]}
                onValueChange={([value]) => reset({ ...watch(), attendance_warning_threshold: value })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">{ts('academic.attendanceThresholdDescription')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="late_arrival">{ts('academic.lateArrivalThreshold')}</Label>
              <Input id="late_arrival" type="number" min={0} className="h-11" placeholder="15" />
              <p className="text-xs text-muted-foreground">{ts('academic.lateArrivalThresholdDescription')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max_students">{ts('academic.maxStudentsPerSection')}</Label>
              <Input id="max_students" type="number" min={10} max={100} className="h-11" placeholder="40" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start_month">{ts('academic.academicYearStartMonth')}</Label>
              <Select defaultValue="9">
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('academic.faceRecognitionEnabled')}</Label>
              </div>
              <Switch checked={faceRecognitionEnabled} onCheckedChange={setFaceRecognitionEnabled} />
            </div>

            {faceRecognitionEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{ts('academic.faceRecognitionConfidence')}</Label>
                  <span className="text-sm text-muted-foreground">{watch('confidence_threshold')}%</span>
                </div>
                <Slider
                  min={50}
                  max={100}
                  step={1}
                  value={[watch('confidence_threshold')]}
                  onValueChange={([value]) => reset({ ...watch(), confidence_threshold: value })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">{ts('academic.faceRecognitionConfidenceDescription')}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="gap-2 min-h-[44px]" disabled={!isDirty || updateAcademicSettings.isPending}>
                {updateAcademicSettings.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />{tc('loading')}</> : <><Save className="h-4 w-4" />{ts('academic.saveSettings')}</>}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2 min-h-[44px]" disabled={!isDirty}>
                <RotateCcw className="h-4 w-4" /> {ts('resetToDefaults')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function NotificationsTab() {
  const ts = useTranslations('settingsPage');
  const tc = useTranslations('common');
  const { data: notificationSettings, isLoading } = useNotificationSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NotificationSettingsForm>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      absence_alert: true,
      low_grade_alert: true,
      fee_reminder: true,
      consecutive_absence_threshold: 3,
    },
  });

  useEffect(() => {
    if (notificationSettings) {
      reset({
        absence_alert: notificationSettings.absence_alert ?? true,
        low_grade_alert: notificationSettings.low_grade_alert ?? true,
        fee_reminder: notificationSettings.fee_reminder ?? true,
        consecutive_absence_threshold: notificationSettings.consecutive_absence_threshold ?? 3,
      });
    }
  }, [notificationSettings, reset]);

  const onSubmit = (data: NotificationSettingsForm) => {
    updateNotificationSettings.mutate(data);
  };

  const handleReset = () => {
    reset({
      absence_alert: true,
      low_grade_alert: true,
      fee_reminder: true,
      consecutive_absence_threshold: 3,
    });
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;

  return (
    <TabsContent value="notifications">
      <Card>
        <CardHeader>
          <CardTitle>{ts('notifications.title')}</CardTitle>
          <CardDescription>{ts('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('notifications.emailNotificationsEnabled')}</Label>
                <p className="text-sm text-muted-foreground">{ts('notifications.emailNotificationsEnabledDescription')}</p>
              </div>
              <Switch {...register('absence_alert')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('notifications.smsNotificationsEnabled')}</Label>
                <p className="text-sm text-muted-foreground">{ts('notifications.smsNotificationsEnabledDescription')}</p>
              </div>
              <Switch {...register('low_grade_alert')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="absence_threshold">{ts('notifications.absenceAlertThreshold')}</Label>
              <Input id="absence_threshold" type="number" min={1} max={10} {...register('consecutive_absence_threshold', { valueAsNumber: true })} className="h-11" />
              <p className="text-xs text-muted-foreground">{ts('notifications.absenceAlertThresholdDescription')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="grade_threshold">{ts('notifications.lowGradeAlertThreshold')}</Label>
              <Input id="grade_threshold" type="number" min={0} max={100} className="h-11" placeholder="50" />
              <p className="text-xs text-muted-foreground">{ts('notifications.lowGradeAlertThresholdDescription')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fee_reminder_days">{ts('notifications.feeReminderDaysBefore')}</Label>
              <Input id="fee_reminder_days" type="number" min={1} max={30} className="h-11" placeholder="7" />
              <p className="text-xs text-muted-foreground">{ts('notifications.feeReminderDaysBeforeDescription')}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('notifications.notifyGuardianOnAbsence')}</Label>
                <p className="text-sm text-muted-foreground">{ts('notifications.notifyGuardianOnAbsenceDescription')}</p>
              </div>
              <Switch {...register('fee_reminder')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('notifications.notifyGuardianOnLowGrade')}</Label>
                <p className="text-sm text-muted-foreground">{ts('notifications.notifyGuardianOnLowGradeDescription')}</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="gap-2 min-h-[44px]" disabled={!isDirty || updateNotificationSettings.isPending}>
                {updateNotificationSettings.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />{tc('loading')}</> : <><Save className="h-4 w-4" />{ts('notifications.saveSettings')}</>}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2 min-h-[44px]" disabled={!isDirty}>
                <RotateCcw className="h-4 w-4" /> {ts('resetToDefaults')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function AppearanceTab({
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  dateFormat,
  onDateFormatChange,
  timeFormat,
  onTimeFormatChange,
}: {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (value: 'light' | 'dark' | 'system') => void;
  language: 'en' | 'am';
  onLanguageChange: (value: 'en' | 'am') => void;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  onDateFormatChange: (value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => void;
  timeFormat: '12h' | '24h';
  onTimeFormatChange: (value: '12h' | '24h') => void;
}) {
  const ts = useTranslations('settingsPage');
  const tc = useTranslations('common');

  return (
    <TabsContent value="appearance">
      <Card>
        <CardHeader>
          <CardTitle>{ts('appearance.title')}</CardTitle>
          <CardDescription>{ts('appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{ts('appearance.theme')}</Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{ts('appearance.themeLight')}</SelectItem>
                <SelectItem value="dark">{ts('appearance.themeDark')}</SelectItem>
                <SelectItem value="system">{ts('appearance.themeSystem')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{ts('appearance.language')}</Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{ts('appearance.languageEnglish')}</SelectItem>
                <SelectItem value="am">{ts('appearance.languageAmharic')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{ts('appearance.dateFormat')}</Label>
            <Select value={dateFormat} onValueChange={onDateFormatChange}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">{ts('appearance.dateFormatMDY')}</SelectItem>
                <SelectItem value="DD/MM/YYYY">{ts('appearance.dateFormatDMY')}</SelectItem>
                <SelectItem value="YYYY-MM-DD">{ts('appearance.dateFormatYMD')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{ts('appearance.timeFormat')}</Label>
            <Select value={timeFormat} onValueChange={onTimeFormatChange}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">{ts('appearance.timeFormat12h')}</SelectItem>
                <SelectItem value="24h">{ts('appearance.timeFormat24h')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function SecurityTab() {
  const ts = useTranslations('settingsPage');
  const tc = useTranslations('common');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [require2fa, setRequire2fa] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [passwordComplexity, setPasswordComplexity] = useState(true);

  const onSubmit = () => {
    toast.success(ts('settingsSaved'));
  };

  return (
    <TabsContent value="security">
      <Card>
        <CardHeader>
          <CardTitle>{ts('security.title')}</CardTitle>
          <CardDescription>{ts('security.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
            <div className="space-y-2">
              <Label>{ts('security.sessionTimeout')}</Label>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">{ts('security.sessionTimeout30')}</SelectItem>
                  <SelectItem value="60">{ts('security.sessionTimeout60')}</SelectItem>
                  <SelectItem value="120">{ts('security.sessionTimeout120')}</SelectItem>
                  <SelectItem value="240">{ts('security.sessionTimeout240')}</SelectItem>
                  <SelectItem value="never">{ts('security.sessionTimeoutNever')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('security.require2fa')}</Label>
                <p className="text-sm text-muted-foreground">{ts('security.require2faDescription')}</p>
              </div>
              <Switch checked={require2fa} onCheckedChange={setRequire2fa} />
              <span className="text-xs text-muted-foreground">{ts('security.comingSoon')}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password_expiry">{ts('security.passwordExpiryDays')}</Label>
              <Input id="password_expiry" type="number" min={0} max={365} value={passwordExpiry} onChange={(e) => setPasswordExpiry(Number(e.target.value))} className="h-11" />
              <p className="text-xs text-muted-foreground">{ts('security.passwordExpiryDaysDescription')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="min_password">{ts('security.minPasswordLength')}</Label>
              <Input id="min_password" type="number" min={8} max={32} value={minPasswordLength} onChange={(e) => setMinPasswordLength(Number(e.target.value))} className="h-11" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('security.passwordComplexityRequired')}</Label>
                <p className="text-sm text-muted-foreground">{ts('security.passwordComplexityRequiredDescription')}</p>
              </div>
              <Switch checked={passwordComplexity} onCheckedChange={setPasswordComplexity} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="gap-2 min-h-[44px]">
                <Save className="h-4 w-4" /> {ts('security.saveSettings')}
              </Button>
              <Button type="button" variant="outline" className="gap-2 min-h-[44px]">
                <RotateCcw className="h-4 w-4" /> {ts('resetToDefaults')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function AttendanceTab() {
  const ts = useTranslations('settingsPage');
  const tc = useTranslations('common');
  const [defaultMethod, setDefaultMethod] = useState('manual');
  const [autoMarkAbsent, setAutoMarkAbsent] = useState(15);
  const [allowEditing, setAllowEditing] = useState(true);
  const [reportTemplate, setReportTemplate] = useState('standard');
  const [faceRecognition, setFaceRecognition] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  const onSubmit = () => {
    toast.success(ts('settingsSaved'));
  };

  return (
    <TabsContent value="attendance">
      <Card>
        <CardHeader>
          <CardTitle>{ts('attendance.title')}</CardTitle>
          <CardDescription>{ts('attendance.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
            <div className="space-y-2">
              <Label>{ts('attendance.defaultMethod')}</Label>
              <Select value={defaultMethod} onValueChange={setDefaultMethod}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{ts('attendance.methodManual')}</SelectItem>
                  <SelectItem value="face">{ts('attendance.methodFace')}</SelectItem>
                  <SelectItem value="barcode">{ts('attendance.methodBarcode')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="auto_mark">{ts('attendance.autoMarkAbsentAfter')}</Label>
              <Input id="auto_mark" type="number" min={5} max={60} value={autoMarkAbsent} onChange={(e) => setAutoMarkAbsent(Number(e.target.value))} className="h-11" />
              <p className="text-xs text-muted-foreground">{ts('attendance.autoMarkAbsentAfterDescription')}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('attendance.allowEditingPrevious')}</Label>
                <p className="text-sm text-muted-foreground">{ts('attendance.allowEditingPreviousDescription')}</p>
              </div>
              <Switch checked={allowEditing} onCheckedChange={setAllowEditing} />
            </div>

            <div className="space-y-2">
              <Label>{ts('attendance.reportTemplate')}</Label>
              <Select value={reportTemplate} onValueChange={setReportTemplate}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{ts('attendance.templateStandard')}</SelectItem>
                  <SelectItem value="detailed">{ts('attendance.templateDetailed')}</SelectItem>
                  <SelectItem value="summary">{ts('attendance.templateSummary')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{ts('attendance.faceRecognition')}</Label>
                <p className="text-sm text-muted-foreground">{ts('attendance.faceRecognitionDescription')}</p>
              </div>
              <Switch checked={faceRecognition} onCheckedChange={setFaceRecognition} />
            </div>

            {faceRecognition && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{ts('attendance.confidenceThreshold')}</Label>
                  <span className="text-sm text-muted-foreground">{confidenceThreshold}%</span>
                </div>
                <Slider
                  min={50}
                  max={99}
                  step={1}
                  value={[confidenceThreshold]}
                  onValueChange={([value]) => setConfidenceThreshold(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">{ts('attendance.confidenceThresholdDescription')}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="gap-2 min-h-[44px]">
                <Save className="h-4 w-4" /> {ts('attendance.saveSettings')}
              </Button>
              <Button type="button" variant="outline" className="gap-2 min-h-[44px]">
                <RotateCcw className="h-4 w-4" /> {ts('resetToDefaults')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default function SettingsPageWrapper() {
  return <ProtectedRoute><SettingsPage /></ProtectedRoute>;
}

'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Globe, Bell, Shield, Palette, Building, ScanFace } from 'lucide-react';

export default function SettingsPage() {
  const tc = useTranslations('common');
  const ts = useTranslations('settingsPage');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tc('settings')}
        description={ts('description')}
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="gap-2">
            <Building className="h-4 w-4" /> {ts('tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> {ts('tabs.appearance')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> {ts('tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> {ts('tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-2">
            <Globe className="h-4 w-4" /> {ts('tabs.localization')}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <ScanFace className="h-4 w-4" /> {tc('attendance')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{ts('general.title')}</CardTitle>
              <CardDescription>
                {ts('general.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="school-name">{ts('general.schoolName')}</Label>
                <Input id="school-name" defaultValue={ts('general.schoolNameValue')} className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="school-address">{tc('address')}</Label>
                <Input id="school-address" defaultValue={ts('general.schoolAddressValue')} className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="school-phone">{ts('general.phone')}</Label>
                  <Input id="school-phone" defaultValue="+251 11223344" className="h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school-email">{ts('general.publicEmail')}</Label>
                  <Input id="school-email" defaultValue="info@sample.edu.et" className="h-11" />
                </div>
              </div>
              <Button className="h-11">{ts('general.saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{ts('appearance.title')}</CardTitle>
              <CardDescription>
                {ts('appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{ts('appearance.darkMode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {ts('appearance.darkModeDescription')}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{ts('appearance.sidebarCollapsed')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {ts('appearance.sidebarCollapsedDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="h-11">{ts('appearance.applyTheme')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{ts('security.title')}</CardTitle>
              <CardDescription>
                {ts('security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{ts('security.twoFactorAuthentication')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {ts('security.twoFactorAuthenticationDescription')}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{ts('security.sessionTimeout')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {ts('security.sessionTimeoutDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="h-11" variant="outline">{ts('security.advancedSettings')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>{tc('attendance')}</CardTitle>
              <CardDescription>
                {ts('attendance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{ts('attendance.faceRecognition')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {ts('attendance.faceRecognitionDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{ts('attendance.confidenceThreshold')}</Label>
                  <span className="text-sm text-muted-foreground">80%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="99"
                  defaultValue="80"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-xs text-muted-foreground">
                  {ts('attendance.confidenceThresholdDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{ts('attendance.lateArrivalThreshold')}</Label>
                <Input type="time" defaultValue="08:00" className="h-11 w-40" />
                <p className="text-xs text-muted-foreground">
                  {ts('attendance.lateArrivalThresholdDescription')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{ts('attendance.allowManualOverride')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {ts('attendance.allowManualOverrideDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>{ts('attendance.unknownFaceAction')}</Label>
                <select className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="log">{ts('attendance.logOnly')}</option>
                  <option value="alert">{ts('attendance.triggerAlert')}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {ts('attendance.unknownFaceActionDescription')}
                </p>
              </div>

              <Button className="h-11">{ts('attendance.saveSettings')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder for other tabs */}
      </Tabs>
    </div>
  );
}

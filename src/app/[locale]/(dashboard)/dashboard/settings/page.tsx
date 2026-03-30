'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Globe, Bell, Shield, Palette, Building } from 'lucide-react';

export default function SettingsPage() {
  const tc = useTranslations('common');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tc('settings')}
        description="Manage your school settings and system preferences"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="gap-2">
            <Building className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-2">
            <Globe className="h-4 w-4" /> Localization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>
                Update your school's basic information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input id="school-name" defaultValue="Sample High School" className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="school-address">Address</Label>
                <Input id="school-address" defaultValue="Addis Ababa, Ethiopia" className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="school-phone">Phone</Label>
                  <Input id="school-phone" defaultValue="+251 11223344" className="h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school-email">Public Email</Label>
                  <Input id="school-email" defaultValue="info@sample.edu.et" className="h-11" />
                </div>
              </div>
              <Button className="h-11">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how the system looks for all users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable high-contrast dark theme.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sidebar Collapsed</Label>
                  <p className="text-sm text-muted-foreground">
                    Start with a collapsed sidebar on larger screens.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="h-11">Apply Theme</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>
                Manage system-wide security policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all administrative accounts.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Log out users after 30 minutes of inactivity.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="h-11" variant="outline">Advanced Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Placeholder for other tabs */}
      </Tabs>
    </div>
  );
}

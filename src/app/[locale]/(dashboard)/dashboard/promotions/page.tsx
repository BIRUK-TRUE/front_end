'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Upload, History } from 'lucide-react';
import { PromotionWizard } from '@/features/promotions/components/PromotionWizard';
import { BulkImportWizard } from '@/features/promotions/components/BulkImportWizard';

export default function PromotionsPage() {
  const t = useTranslations('promotions');
  const [activeTab, setActiveTab] = useState('yearly');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Promotion & Enrollment Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage yearly student promotions, bulk imports, and enrollment assignments
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="yearly" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Yearly Promotion
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Initial Setup
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Yearly Promotion Tab */}
        <TabsContent value="yearly" className="mt-6">
          <PromotionWizard />
        </TabsContent>

        {/* Initial Setup Tab */}
        <TabsContent value="import" className="mt-6">
          <BulkImportWizard />
        </TabsContent>

        {/* History Tab - Placeholder */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotion History</CardTitle>
              <CardDescription>
                View past promotion records and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Promotion history tracking will be available in a future update.</p>
                <p className="text-sm mt-2">
                  This feature will allow you to view, filter, and export past promotion records.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export function BulkImportWizard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Student Import</CardTitle>
        <CardDescription>
          Import students for new school setup with automatic section assignment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Bulk import functionality will be available in a future update.</p>
          <p className="text-sm mt-2">
            This feature will allow you to upload CSV files with student data and automatically assign them to sections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

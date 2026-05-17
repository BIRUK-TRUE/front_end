'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Upload, Check, AlertCircle, ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useClass } from '@/features/academics/api/useClasses';
import { useRecognizeFaces } from '@/hooks/use-face-recognition';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ClassroomPhotoPage() {
  const t = useTranslations('faceScan');
  const tc = useTranslations('common');
  const ta = useTranslations('attendancePage');
  const router = useRouter();

  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const recognizeFaces = useRecognizeFaces();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!photo || !selectedSectionId) return;

    recognizeFaces.mutate({ sectionId: selectedSectionId, photo }, {
      onSuccess: (data) => {
        toast.success(`Recognized ${data.count} students. Attendance draft created.`);
        // Redirect to attendance page with the section and date selected?
        // For now just go back
        router.push('/dashboard/attendance');
      },
      onError: () => {
        toast.error("Failed to process image. Ensure it's a clear photo of the classroom.");
      }
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl animate-fade-in">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t('recognize')}
          </CardTitle>
          <CardDescription>
            {t('uploadPhoto')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tc('academicYear')}</Label>
              <Select value={selectedYearId} onValueChange={(v) => { setSelectedYearId(v); setSelectedClassId(''); setSelectedSectionId(''); }}>
                <SelectTrigger><SelectValue placeholder={tc('selectYear')} /></SelectTrigger>
                <SelectContent>
                  {yearsData?.items?.map((y: any) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tc('class')}</Label>
              <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSectionId(''); }} disabled={!selectedYearId}>
                <SelectTrigger><SelectValue placeholder={tc('selectClass')} /></SelectTrigger>
                <SelectContent>
                  {classesData?.items?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tc('section')}</Label>
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId}>
              <SelectTrigger><SelectValue placeholder={tc('selectSection')} /></SelectTrigger>
              <SelectContent>
                {classDetail?.sections?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="classroom-photo"
            />
            <label
              htmlFor="classroom-photo"
              className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-all border-muted-foreground/25"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-lg">{t('capturePhoto')}</p>
                    <p className="text-sm text-muted-foreground">JPEG, PNG up to 10MB</p>
                  </div>
                </div>
              )}
            </label>
            {preview && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-4 right-4 shadow-lg"
                onClick={() => { setPhoto(null); setPreview(null); }}
              >
                {t('retake')}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12 text-lg gap-2" 
            disabled={!photo || !selectedSectionId || recognizeFaces.isPending}
            onClick={handleUpload}
          >
            {recognizeFaces.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            {ta('submitAttendance')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

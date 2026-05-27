'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Upload, ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useClass } from '@/features/academics/api/useClasses';
import { useRecognizeFaces } from '@/hooks/use-face-recognition';
import { useAcademicSettings } from '@/hooks/use-settings';
import { axiosInstance } from '@/lib/api/axios';
import { confidenceToDistanceThreshold } from '@/lib/face/load-models';
import { useRouter } from '@/i18n/navigation';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: academicSettings } = useAcademicSettings();
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

    setIsProcessing(true);

    try {
      const { extractFaceDescriptorsFromFile } = await import('@/lib/face/extract-descriptors');
      const descriptors = await extractFaceDescriptorsFromFile(photo);

      if (!descriptors.length) {
        toast.error('No faces detected in the image. Please try a clearer photo.');
        return;
      }

      const threshold = confidenceToDistanceThreshold(
        academicSettings?.confidence_threshold,
      );

      const result = await recognizeFaces.mutateAsync({
        sectionId: selectedSectionId,
        descriptors,
        threshold,
      });

      if (!result.matches.length) {
        toast.error('No enrolled students matched in this photo.');
        return;
      }

      const timestamp = new Date().toISOString();
      let marked = 0;
      let skipped = 0;

      for (const match of result.matches) {
        try {
          await axiosInstance.post('/attendance/mark-by-face', {
            studentId: match.studentId,
            sectionId: selectedSectionId,
            timestamp,
            confidence: Math.round(match.confidence * 100),
            method: 'face_recognition',
          });
          marked += 1;
        } catch (error: unknown) {
          const status = (error as { response?: { status?: number } })?.response
            ?.status;
          if (status === 409) {
            skipped += 1;
          }
        }
      }

      if (marked > 0) {
        toast.success(
          `Marked ${marked} student${marked === 1 ? '' : 's'} present` +
            (skipped ? ` (${skipped} already marked)` : ''),
        );
        router.push('/dashboard/attendance');
      } else if (skipped > 0) {
        toast.info('All matched students were already marked for today.');
        router.push('/dashboard/attendance');
      } else {
        toast.error('Recognition succeeded but attendance could not be saved.');
      }
    } catch {
      toast.error('Failed to process image. Ensure it is a clear photo of the classroom.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = isProcessing || recognizeFaces.isPending;

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
                  {yearsData?.items?.map((y: { id: string; name: string }) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tc('class')}</Label>
              <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSectionId(''); }} disabled={!selectedYearId}>
                <SelectTrigger><SelectValue placeholder={tc('selectClass')} /></SelectTrigger>
                <SelectContent>
                  {classesData?.items?.map((c: { id: string; name: string }) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tc('section')}</Label>
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId}>
              <SelectTrigger><SelectValue placeholder={tc('selectSection')} /></SelectTrigger>
              <SelectContent>
                {classDetail?.sections?.map((s: { id: string; name: string }) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
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
            disabled={!photo || !selectedSectionId || isBusy}
            onClick={handleUpload}
          >
            {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            {ta('submitAttendance')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

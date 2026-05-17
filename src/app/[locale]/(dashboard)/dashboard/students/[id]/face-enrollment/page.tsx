'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFaceEnrollmentStatus, useEnrollFace } from '@/hooks/use-face-recognition';
import { useStudent } from '@/hooks/use-students';

export default function FaceEnrollmentPage() {
  const { id } = useParams();
  const studentId = id as string;
  const t = useTranslations('faceScan');
  const router = useRouter();
  
  const { data: student } = useStudent(studentId);
  const { data: status, isLoading: statusLoading } = useFaceEnrollmentStatus(studentId);
  const enrollFace = useEnrollFace();

  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setIsCapturing(false);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setIsCapturing(true);
  };

  const handleEnroll = async () => {
    if (!imgSrc) return;

    // Convert base64 to file
    const res = await fetch(imgSrc);
    const blob = await res.blob();
    const file = new File([blob], 'enrollment.jpg', { type: 'image/jpeg' });

    enrollFace.mutate({ studentId, photo: file }, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  if (statusLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            {t('faceEnrollment')} - {student?.user.full_name}
          </CardTitle>
          <CardDescription>
            {t('enrollmentDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status?.is_enrolled && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>{t('alreadyEnrolled')}</AlertTitle>
              <AlertDescription>
                {t('enrolledOn')} {new Date(status.enrolled_at!).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
            {isCapturing ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
              />
            ) : (
              imgSrc && <img src={imgSrc} alt="Capture" className="w-full h-full object-cover" />
            )}
            
            {isCapturing && (
              <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 m-8 rounded-full flex items-center justify-center">
                <div className="w-1/2 h-1/2 border-2 border-primary/40 rounded-full border-dashed" />
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 border border-yellow-100">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <ul className="list-disc pl-4 space-y-1">
              <li>{t('tip1')}</li>
              <li>{t('tip2')}</li>
              <li>{t('tip3')}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isCapturing ? (
            <Button onClick={capture} className="w-full flex items-center gap-2">
              <Camera className="h-4 w-4" /> {t('capturePhoto')}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={retake} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> {t('retake')}
              </Button>
              <Button onClick={handleEnroll} disabled={enrollFace.isPending} className="flex items-center gap-2">
                {enrollFace.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t('saveEnrollment')}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

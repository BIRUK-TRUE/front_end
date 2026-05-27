'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, AlertCircle, ArrowLeft, Loader2, ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useFaceEnrollmentStatus, useEnrollFace } from '@/hooks/use-face-recognition';
import { useStudent } from '@/hooks/use-students';
import { toast } from 'sonner';

const MODEL_URL = '/models';
const FALLBACK_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export default function FaceEnrollmentPage() {
  const { id } = useParams();
  const studentId = id as string;
  const t = useTranslations('faceScan');
  const router = useRouter();
  
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const { data: status, isLoading: statusLoading } = useFaceEnrollmentStatus(studentId);
  const enrollFace = useEnrollFace();

  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [faceApi, setFaceApi] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureStep, setCaptureStep] = useState(0);
  const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);

  const REQUIRED_CAPTURES = 3; // Number of face captures needed

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import('face-api.js');
        setFaceApi(faceapi);
        
        const loadFrom = async (url: string) => {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(url),
            faceapi.nets.faceLandmark68Net.loadFromUri(url),
            faceapi.nets.faceRecognitionNet.loadFromUri(url),
          ]);
        };

        try {
          await loadFrom(MODEL_URL);
        } catch (e) {
          console.log('Loading models from CDN fallback...');
          await loadFrom(FALLBACK_MODEL_URL);
        }
        
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        toast.error('Failed to load face recognition models');
        setIsModelLoading(false);
      }
    };
    loadModels();
  }, []);

  // Update video ref when webcam is ready
  useEffect(() => {
    if (webcamRef.current?.video) {
      videoRef.current = webcamRef.current.video;
    }
  }, [webcamRef.current]);

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
    setCaptureStep(0);
    setCapturedDescriptors([]);
  };

  const captureWithFaceDetection = async () => {
    if (!faceApi || !videoRef.current || isProcessing) {
      toast.error('Camera not ready. Please wait...');
      return;
    }

    setIsProcessing(true);

    try {
      // Detect face and extract descriptor
      const detection = await faceApi
        .detectSingleFace(videoRef.current, new faceApi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected. Please ensure your face is clearly visible.');
        setIsProcessing(false);
        return;
      }

      // Add descriptor to collection
      const descriptor = Array.from(detection.descriptor);
      const newDescriptors = [...capturedDescriptors, descriptor];
      setCapturedDescriptors(newDescriptors);
      
      // Take screenshot for preview
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setImgSrc(imageSrc);
      }

      // Move to next step
      const nextStep = captureStep + 1;
      setCaptureStep(nextStep);

      if (nextStep >= REQUIRED_CAPTURES) {
        // All captures done, ready to enroll
        setIsCapturing(false);
        toast.success(`Captured ${REQUIRED_CAPTURES} face samples successfully!`);
      } else {
        toast.success(`Capture ${nextStep}/${REQUIRED_CAPTURES} successful!`);
        // Wait a moment before allowing next capture
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Face detection error:', error);
      toast.error('Failed to detect face. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleEnroll = async () => {
    if (capturedDescriptors.length < REQUIRED_CAPTURES) {
      toast.error(`Please capture at least ${REQUIRED_CAPTURES} face samples`);
      return;
    }

    enrollFace.mutate({ 
      studentId, 
      descriptors: capturedDescriptors 
    }, {
      onSuccess: () => {
        toast.success('Face enrolled successfully!');
        router.back();
      },
      onError: (error: any) => {
        console.error('Enrollment error:', error);
        toast.error(error?.message || 'Failed to enroll face');
      }
    });
  };

  // Get student name safely from different possible structures
  const studentName = student?.user?.full_name || student?.full_name || 'Student';

  if (statusLoading || studentLoading || isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {isModelLoading ? 'Loading face recognition models...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            {t('faceEnrollment')} - {studentName}
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

          {/* Progress Indicator */}
          {isCapturing && captureStep > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Capture Progress</span>
                <span className="text-primary font-bold">{captureStep}/{REQUIRED_CAPTURES}</span>
              </div>
              <Progress value={(captureStep / REQUIRED_CAPTURES) * 100} className="h-2" />
            </div>
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
                onUserMedia={() => {
                  if (webcamRef.current?.video) {
                    videoRef.current = webcamRef.current.video;
                  }
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

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-2xl">
                  <ScanFace className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 border border-yellow-100">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <ul className="list-disc pl-4 space-y-1">
              <li>{t('tip1')}</li>
              <li>{t('tip2')}</li>
              <li>{t('tip3')}</li>
              <li>Multiple captures will be taken for better accuracy</li>
            </ul>
          </div>

          {/* Capture Instructions */}
          {isCapturing && captureStep < REQUIRED_CAPTURES && (
            <Alert className="bg-blue-50 border-blue-200">
              <ScanFace className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">
                {captureStep === 0 && 'Step 1: Look straight at the camera'}
                {captureStep === 1 && 'Step 2: Turn your head slightly to the left'}
                {captureStep === 2 && 'Step 3: Turn your head slightly to the right'}
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Hold still and click capture when ready
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isCapturing ? (
            <>
              <Button 
                variant="outline" 
                onClick={retake} 
                disabled={captureStep === 0}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
              <Button 
                onClick={captureWithFaceDetection} 
                disabled={isProcessing || !faceApi}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" /> 
                    {captureStep === 0 ? 'Start Capture' : `Capture ${captureStep + 1}/${REQUIRED_CAPTURES}`}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={retake} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Retake All
              </Button>
              <Button 
                onClick={handleEnroll} 
                disabled={enrollFace.isPending || capturedDescriptors.length < REQUIRED_CAPTURES} 
                className="flex items-center gap-2"
              >
                {enrollFace.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enrolling...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> {t('saveEnrollment')}
                  </>
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

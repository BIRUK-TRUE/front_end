'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  Camera, 
  ScanFace, 
  CheckCircle2, 
  Loader2, 
  RefreshCcw,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

import { useFaceEnrollment } from '../hooks/useFaceEnrollment';

interface FaceEnrollmentFlowProps {
  student: {
    id: string;
    name: string;
    registration_number: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

// Load face-api models (prefer local if exists, else CDN)
const MODEL_URL = '/models'; 
const FALLBACK_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export function FaceEnrollmentFlow({ 
  student, 
  onComplete, 
  onCancel 
}: FaceEnrollmentFlowProps) {
  const t = useTranslations('faceAttendance.enrollment');
  const { enrollFace } = useFaceEnrollment();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [faceApi, setFaceApi] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Enrollment Progress
  const [step, setStep] = useState(0);
  const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<'idle' | 'capturing' | 'saving' | 'success' | 'error'>('idle');

  const steps = [
    { key: 'step1', label: t('instructions.step1') },
    { key: 'step2', label: t('instructions.step2') },
    { key: 'step3', label: t('instructions.step3') },
    { key: 'step4', label: t('instructions.step4') },
    { key: 'step5', label: t('instructions.step5') },
  ];

  // Load Models
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
          await loadFrom(FALLBACK_MODEL_URL);
        }
        
        setIsModelLoading(false);
      } catch (error) {
        toast.error(t('loadModelsFailed'));
      }
    };
    loadModels();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast.error(t('cameraAccessFailed'));
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }, []);

  const captureDescriptor = async () => {
    if (!faceApi || !videoRef.current || isCapturing) return;

    setIsCapturing(true);
    setEnrollStatus('capturing');

    try {
      const detection = await faceApi
        .detectSingleFace(videoRef.current, new faceApi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setCapturedDescriptors(prev => [...prev, Array.from(detection.descriptor)]);
        
        if (step < steps.length - 1) {
          setStep(prev => prev + 1);
          setEnrollStatus('idle');
        } else {
          setEnrollStatus('saving');
          handleFinalSubmit([...capturedDescriptors, Array.from(detection.descriptor)]);
        }
      } else {
        toast.error(t('captureFailed'));
        setEnrollStatus('idle');
      }
    } catch (error) {
      setEnrollStatus('error');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFinalSubmit = (finalDescriptors: number[][]) => {
    enrollFace.mutate({
      studentId: student.id,
      descriptors: finalDescriptors
    }, {
      onSuccess: () => {
        setEnrollStatus('success');
        stopCamera();
        setTimeout(() => onComplete(), 1500);
      },
      onError: () => {
        setEnrollStatus('error');
      }
    });
  };

  const resetEnrollment = () => {
    setStep(0);
    setCapturedDescriptors([]);
    setEnrollStatus('idle');
  };

  if (isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('initializing')}</p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {t('for')}: <span className="font-bold text-foreground">{student.name}</span>
              <Badge variant="outline" className="text-[10px] font-mono">{student.registration_number}</Badge>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isCapturing}>{t('cancelEnrollment')}</Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover mirror"
          />
          {isCameraActive && (
             <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none">
                {/* Visual Guides */}
                <div className="absolute inset-x-0 top-1/4 h-px bg-white/20" />
                <div className="absolute inset-x-0 bottom-1/4 h-px bg-white/20" />
                <div className="absolute inset-y-0 left-1/4 w-px bg-white/20" />
                <div className="absolute inset-y-0 right-1/4 w-px bg-white/20" />
             </div>
          )}

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <Camera className="h-16 w-16 text-white/50 mb-4" />
              <Button onClick={startCamera} size="default" className="rounded-xl h-12">{t('activateCamera')}</Button>
            </div>
          )}

          {enrollStatus === 'capturing' && (
             <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px] z-20">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-2xl animate-ping">
                  <ScanFace className="h-10 w-10 text-primary" />
                </div>
             </div>
          )}

          {enrollStatus === 'success' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/90 backdrop-blur-sm z-30 animate-in fade-in duration-500">
                <CheckCircle2 className="h-20 w-20 text-white mb-4 animate-bounce" />
                <p className="text-white text-xl font-bold">{t('enrollSuccess')}</p>
             </div>
          )}
        </div>

        {isCameraActive && enrollStatus !== 'success' && (
          <div className="space-y-6">
            {/* Progress Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>{t('captureProgress')}</span>
                <span className="text-primary">{step + 1} / {steps.length}</span>
              </div>
              <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
            </div>

            {/* Current Instruction */}
            <Alert className="bg-primary/5 border-primary/20 shadow-none py-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                 <ScanFace className="h-6 w-6 text-primary" />
              </div>
              <AlertTitle className="text-center text-lg font-black">{steps[step].label}</AlertTitle>
              <AlertDescription className="text-center text-muted-foreground">
                {t('holdStill')}
              </AlertDescription>
            </Alert>

            <div className="flex justify-center gap-4">
               <Button 
                size="lg" 
                onClick={captureDescriptor} 
                disabled={isCapturing || enrollStatus === 'saving'}
                className="rounded-full w-full h-16 text-lg font-bold shadow-lg shadow-primary/20"
              >
                {isCapturing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isCapturing ? t('processing') : t('captureAlignment')}
                {!isCapturing && <ChevronRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Alert className="bg-slate-50 border-none">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-[11px] text-muted-foreground italic leading-relaxed">
              {t('privacy')}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 flex justify-between p-6">
        <Button variant="ghost" size="sm" onClick={resetEnrollment} disabled={isCapturing || step === 0}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          End-to-End Encrypted Data
        </div>
      </CardFooter>
    </Card>
  );
}

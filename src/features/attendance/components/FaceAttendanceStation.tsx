'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  Camera, 
  ScanFace, 
  AlertCircle, 
  Loader2, 
  Settings2, 
  Maximize2, 
  Minimize2,
  XCircle,
  ShieldCheck,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { useFaceAttendance } from '../hooks/useFaceAttendance';
import { AttendanceStatus } from '../types';
import { LiveAttendanceLog } from './LiveAttendanceLog';
import { AttendanceSessionSummary } from './AttendanceSessionSummary';
import { ManualOverrideSearch } from './ManualOverrideSearch';
import { useAcademicSettings } from '@/hooks/useSettings';

interface FaceAttendanceStationProps {
  sectionId: string;
  sectionName: string;
  onClose: () => void;
  students: Array<{
    id: string;
    name: string;
    registration_number: string;
  }>;
}

// Load face-api models (prefer local if exists, else CDN)
const MODEL_URL = '/models'; 
const FALLBACK_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export function FaceAttendanceStation({ 
  sectionId, 
  sectionName, 
  onClose,
  students 
}: FaceAttendanceStationProps) {
  const t = useTranslations('faceAttendance.station');
  const { descriptors, markAttendance, logUnknownFace } = useFaceAttendance(sectionId);
  const { data: academicSettings } = useAcademicSettings();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [faceApi, setFaceApi] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  
  // Recognition State
  const [sessionEntries, setSessionEntries] = useState<any[]>([]);
  const [lastMarkedId, setLastMarkedId] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'searching' | 'detected' | 'matched' | 'unknown'>('idle');
  const [matchConfidence, setMatchConfidence] = useState(0);

  // Marked students Set for fast lookup
  const markedStudentIds = useMemo(() => new Set(sessionEntries.map(e => e.student_id)), [sessionEntries]);

  // Privacy acknowledgment check
  useEffect(() => {
    const acknowledged = localStorage.getItem('face-privacy-acknowledged') === 'true';
    setPrivacyAcknowledged(acknowledged);
    if (!acknowledged) {
      setShowPrivacyNotice(true);
    }
  }, []);

  const handlePrivacyAcknowledge = () => {
    localStorage.setItem('face-privacy-acknowledged', 'true');
    setPrivacyAcknowledged(true);
    setShowPrivacyNotice(false);
  };

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
          console.warn('Local models not found, falling back to CDN');
          await loadFrom(FALLBACK_MODEL_URL);
        }
        
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        toast.error(t('cameraError'));
      }
    };
    loadModels();
  }, [t]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Start/Stop Camera
  const startCamera = useCallback(async () => {
    if (!privacyAcknowledged) {
      setShowPrivacyNotice(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setDetectionStatus('searching');
      }
    } catch (error) {
      toast.error(t('cameraError'));
    }
  }, [t, privacyAcknowledged]);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setDetectionStatus('idle');
  }, []);

  // Main Detection Loop
  useEffect(() => {
    if (!isCameraActive || !faceApi || !videoRef.current || !canvasRef.current) return;

    let animationId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
    faceApi.matchDimensions(canvas, displaySize);

    const runDetection = async () => {
      if (video.paused || video.ended) return;

      const detections = await faceApi
        .detectAllFaces(video, new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceApi.resizeResults(detections, displaySize);
      
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections.length > 0) {
        setDetectionStatus('detected');
        
        // Match logic
        const detection = resizedDetections[0];
        const descriptor = detection.descriptor;
        
        let bestMatch = { id: '', distance: 1.0 };
        
        // Compare with enrolled faces
        descriptors.forEach((student: any) => {
          student.descriptors.forEach((storedDescriptor: number[]) => {
            const dist = faceApi.euclideanDistance(descriptor, storedDescriptor);
            if (dist < bestMatch.distance) {
              bestMatch = { id: student.student_id, distance: dist };
            }
          });
        });

        // Similarity = 1 - distance. 0.6 distance is common threshold
        // Read confidence threshold from academic settings (percentage 0-100)
        // Convert to distance threshold: distance = 1 - (confidence / 100)
        const confidencePercent = academicSettings?.confidence_threshold ?? 60;
        const threshold = 1 - (confidencePercent / 100);
        const confidence = Math.round((1 - bestMatch.distance) * 100);
        setMatchConfidence(confidence);

        if (bestMatch.distance < threshold) {
          setDetectionStatus('matched');
          
          if (bestMatch.id !== lastMarkedId && !markedStudentIds.has(bestMatch.id)) {
            const student = students.find(s => s.id === bestMatch.id);
            if (student) {
              handleMarkAttendance(student.id, student.name, student.registration_number, 'face', confidence);
              setLastMarkedId(bestMatch.id);
            }
          }
        } else if (bestMatch.distance > 0.7) {
          setDetectionStatus('unknown');
          // Handle unknown face logging if needed
        }

        // Custom Visual Overlay (Modern Box)
        resizedDetections.forEach((det: any) => {
          const { x, y, width, height } = det.detection.box;
          if (ctx) {
            ctx.strokeStyle = detectionStatus === 'matched' ? '#10b981' : '#3b82f6';
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            // Draw corners only for a premium look
            const len = 20;
            ctx.beginPath();
            ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
            ctx.moveTo(x + width - len, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + len);
            ctx.moveTo(x + width, y + height - len); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width - len, y + height);
            ctx.moveTo(x + len, y + height); ctx.lineTo(x, y + height); ctx.lineTo(x, y + height - len);
            ctx.stroke();

            // Label
            if (detectionStatus === 'matched') {
              const student = students.find(s => s.id === bestMatch.id);
              if (student) {
                ctx.fillStyle = '#10b981';
                ctx.fillRect(x, y - 25, width, 25);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.fillText(`${student.name} (${confidence}%)`, x + 5, y - 8);
              }
            }
          }
        });
      } else {
        setDetectionStatus('searching');
        setLastMarkedId(null);
      }

      animationId = requestAnimationFrame(runDetection);
    };

    runDetection();
    return () => cancelAnimationFrame(animationId);
  }, [isCameraActive, faceApi, descriptors, students, lastMarkedId, markedStudentIds, detectionStatus]);

  const handleMarkAttendance = (
    studentId: string, 
    name: string, 
    reg: string, 
    method: 'face' | 'manual' | 'barcode',
    confidence: number = 100
  ) => {
    const now = new Date();
    const time = format(now, 'HH:mm:ss');
    
    // Check for late arrival based on current time vs threshold (hardcoded 8:30 for demo)
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
    const status = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      student_id: studentId,
      studentName: name,
      registrationNumber: reg,
      time,
      status,
      method,
    };

    setSessionEntries(prev => [newEntry, ...prev]);
    
    // Save to server
    markAttendance.mutate({
      studentId,
      sectionId,
      timestamp: now.toISOString(),
      confidence,
      method: 'face_recognition' as any,
    });

    if (method === 'face') {
      toast.success(t(isLate ? 'markedLate' : 'markedPresent', { name }), {
        duration: 2000,
      });
    }
  };

  if (isModelLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl">
          <CardContent className="p-10 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
            <h2 className="text-xl font-bold mb-2">{t('modelsLoading')}</h2>
            <p className="text-muted-foreground text-center text-sm">{t('privacyNotice')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPrivacyNotice) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>{t('privacyNoticeTitle')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('privacyNoticeDescription')}</p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>{t('privacyPoint1')}</li>
              <li>{t('privacyPoint2')}</li>
              <li>{t('privacyPoint3')}</li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button className="flex-1" onClick={handlePrivacyAcknowledge}>
              {t('acknowledge')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const presentCount = sessionEntries.filter(e => e.status === AttendanceStatus.PRESENT).length;
  const lateCount = sessionEntries.filter(e => e.status === AttendanceStatus.LATE).length;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col bg-slate-50 dark:bg-slate-950 transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-[200]" : "min-h-[calc(100vh-100px)] p-6 rounded-3xl border"
      )}
    >
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
            <ScanFace className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              {t('title')}
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs py-1">
                {sectionName}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <Settings2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
          <Button variant="destructive" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Side: Real-time Visualizer */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="flex-1 overflow-hidden relative bg-black rounded-[2rem] border-4 border-slate-200 dark:border-slate-800 shadow-2xl group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover mirror"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-10 mirror"
            />
            
            {/* HUD Overlays */}
            <div className="absolute inset-x-0 top-0 p-6 z-20 flex justify-between pointer-events-none">
              <Badge 
                className={cn(
                  "p-3 rounded-xl border-none shadow-xl text-sm font-bold uppercase tracking-wider backdrop-blur-md animate-in fade-in zoom-in",
                  isCameraActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                )}
              >
                {isCameraActive ? t('sessionActive') : t('cameraInactive')}
              </Badge>
              
              <div className="flex flex-col items-end gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-white">
                  <p className="text-[10px] uppercase font-bold opacity-70">Detection Status</p>
                  <p className="text-sm font-black capitalize">{detectionStatus}</p>
                </div>
                {detectionStatus === 'matched' && (
                  <div className="bg-emerald-500/80 backdrop-blur-md border border-emerald-400/30 rounded-xl px-4 py-2 text-white animate-pulse">
                    <p className="text-[10px] uppercase font-bold opacity-70">Confidence</p>
                    <p className="text-sm font-black">{matchConfidence}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom HUD */}
            {isCameraActive && (
              <div className="absolute inset-x-0 bottom-0 p-8 z-20 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <ManualOverrideSearch 
                    students={students}
                    markedStudents={markedStudentIds}
                    onMark={(id, status) => {
                      const student = students.find(s => s.id === id);
                      if (student) handleMarkAttendance(id, student.name, student.registration_number, 'manual');
                    }}
                    className="w-80"
                  />
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    onClick={stopCamera} 
                    className="rounded-xl h-11 px-8 shadow-xl"
                  >
                    {t('endSession')}
                  </Button>
                </div>
                <p className="text-white/50 text-xs flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  {t('privacyNotice')}
                </p>
              </div>
            )}

            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-500 z-30">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center animate-in zoom-in-95">
                  <div className="p-6 bg-primary/10 rounded-full mb-6">
                    <Camera className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t('readyToScan')}</h3>
                  <Button size="lg" onClick={startCamera} className="w-full rounded-2xl text-lg h-16 shadow-xl shadow-primary/30">
                    {t('startSession')}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <AttendanceSessionSummary 
            presentCount={presentCount}
            lateCount={lateCount}
            totalStudents={students.length}
          />
        </div>

        {/* Right Side: Activity Log */}
        <div className="lg:col-span-4 h-full">
          <LiveAttendanceLog entries={sessionEntries} className="rounded-[2rem] border-4 border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, ScanFace, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceStatus } from '../types';

interface StudentFace {
  id: string;
  name: string;
  registrationNumber: string;
  descriptor: Float32Array;
}

interface FaceRecognitionScannerProps {
  students: Array<{
    id: string;
    name: string;
    registration_number: string;
  }>;
  onAttendanceMarked: (studentId: string, status: AttendanceStatus) => void;
  markedStudents: Set<string>;
}

// Load face-api models from CDN or local
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export function FaceRecognitionScanner({
  students,
  onAttendanceMarked,
  markedStudents,
}: FaceRecognitionScannerProps) {
  const t = useTranslations('faceAttendance.station');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedStudent, setDetectedStudent] = useState<StudentFace | null>(null);
  const [faceApi, setFaceApi] = useState<any>(null);
  const [registeredFaces, setRegisteredFaces] = useState<StudentFace[]>([]);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api library dynamically
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        const faceapi = await import('face-api.js');
        setFaceApi(faceapi);
        
        // Load models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        
        setIsModelLoading(false);
        toast.success(t('modelsLoaded'));
      } catch (error) {
        console.error('Failed to load face-api:', error);
        toast.error(t('loadModelsFailed'));
        setIsModelLoading(false);
      }
    };

    loadFaceApi();
  }, []);

  // Initialize registered faces from student data
  useEffect(() => {
    // In production, these descriptors would come from the backend
    // For demo, we'll use a mock descriptor generation
    const mockDescriptors: StudentFace[] = students.map((s) => ({
      id: s.id,
      name: s.name,
      registrationNumber: s.registration_number,
      descriptor: new Float32Array(128).map(() => Math.random()), // Mock descriptor
    }));
    setRegisteredFaces(mockDescriptors);
  }, [students]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        toast.success(t('cameraStarted'));
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error(t('cameraAccessFailed'));
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  }, []);

  // Face detection loop
  useEffect(() => {
    if (!isCameraActive || !faceApi || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const detectFaces = async () => {
      if (video.paused || video.ended) return;

      try {
        // Detect faces
        const detections = await faceApi
          .detectAllFaces(video, new faceApi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Clear canvas
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        // Match faces
        if (detections.length > 0 && registeredFaces.length > 0) {
          const detection = detections[0];
          const descriptor = detection.descriptor;

          // Find best match
          let bestMatch: StudentFace | null = null;
          let bestDistance = Infinity;

          for (const student of registeredFaces) {
            const distance = faceApi.euclideanDistance(descriptor, student.descriptor);
            if (distance < bestDistance && distance < 0.6) {
              bestDistance = distance;
              bestMatch = student;
            }
          }

          if (bestMatch && bestMatch.id !== detectedStudent?.id) {
            setDetectedStudent(bestMatch);
            
            // Auto-mark attendance if not already marked
            if (!markedStudents.has(bestMatch.id)) {
              onAttendanceMarked(bestMatch.id, AttendanceStatus.PRESENT);
              toast.success(`Attendance marked for ${bestMatch.name}`);
            }
          }

          // Draw detection box
          const dims = faceApi.matchDimensions(canvas, video, true);
          const resizedDetections = faceApi.resizeResults(detections, dims);
          faceApi.draw.drawDetections(canvas, resizedDetections);
          faceApi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isCameraActive, faceApi, registeredFaces, detectedStudent, markedStudents, onAttendanceMarked]);

  if (isModelLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading face recognition models...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{t('faceRecognition')}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isCameraActive ? (
              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
                {t('active')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                {t('inactive')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            width={640}
            height={480}
          />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <Camera className="h-12 w-12 text-white/50 mb-4" />
              <p className="text-white/70 text-sm">Camera is off</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isCameraActive ? (
              <Button onClick={startCamera} className="gap-2">
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopCamera} className="gap-2">
                <XCircle className="h-4 w-4" />
                Stop Camera
              </Button>
            )}
          </div>

          {/* Detection Status */}
          {detectedStudent && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{detectedStudent.name}</span>
              <Badge variant="outline" className="text-xs">
                {detectedStudent.registrationNumber}
              </Badge>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Position your face in the center of the camera</p>
          <p>• Ensure good lighting for best recognition</p>
          <p>• Attendance will be marked automatically when recognized</p>
        </div>
      </CardContent>
    </Card>
  );
}

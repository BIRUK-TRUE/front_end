'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, ScanFace, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceStatus } from '../types';
import {
  useFaceAttendance,
  type FaceDescriptor,
} from '../hooks/useFaceAttendance';
import { useAcademicSettings } from '@/hooks/use-settings';
import {
  confidenceToDistanceThreshold,
  loadFaceApiModels,
} from '@/lib/face/load-models';

interface FaceRecognitionScannerProps {
  sectionId: string;
  students: Array<{
    id: string;
    name: string;
    registration_number: string;
  }>;
  onAttendanceMarked: (studentId: string, status: AttendanceStatus) => void;
  markedStudents: Set<string>;
}

export function FaceRecognitionScanner({
  sectionId,
  students,
  onAttendanceMarked,
  markedStudents,
}: FaceRecognitionScannerProps) {
  const t = useTranslations('faceAttendance.station');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedStudentId, setDetectedStudentId] = useState<string | null>(null);
  const [faceApi, setFaceApi] = useState<Awaited<
    ReturnType<typeof loadFaceApiModels>
  > | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMarkedRef = useRef<string | null>(null);

  const { descriptors, isLoading: isLoadingDescriptors } =
    useFaceAttendance(sectionId);
  const { data: academicSettings } = useAcademicSettings();

  const distanceThreshold = confidenceToDistanceThreshold(
    academicSettings?.confidence_threshold,
  );

  const studentMap = useCallback(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );

  useEffect(() => {
    loadFaceApiModels()
      .then((faceapi) => {
        setFaceApi(faceapi);
        setIsModelLoading(false);
      })
      .catch(() => {
        toast.error(t('loadModelsFailed'));
        setIsModelLoading(false);
      });
  }, [t]);

  useEffect(() => {
    if (!isLoadingDescriptors && descriptors.length === 0 && sectionId) {
      toast.info(
        t('noEnrolledFaces') ||
          'No students have enrolled faces. Please enroll faces first.',
      );
    }
  }, [descriptors.length, isLoadingDescriptors, sectionId, t]);

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
    } catch {
      toast.error(t('cameraAccessFailed'));
    }
  }, [t]);

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

  useEffect(() => {
    if (
      !isCameraActive ||
      !faceApi ||
      !videoRef.current ||
      !canvasRef.current ||
      descriptors.length === 0
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const lookup = studentMap();

    const detectFaces = async () => {
      if (video.paused || video.ended) return;

      try {
        const detections = await faceApi
          .detectAllFaces(video, new faceApi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length === 0) {
          setDetectedStudentId(null);
          return;
        }

        const detection = detections[0];
        const descriptor = detection.descriptor;

        let bestStudentId = '';
        let bestDistance = 1.0;

        descriptors.forEach((student: FaceDescriptor) => {
          student.descriptors.forEach((storedDescriptor: number[]) => {
            const dist = faceApi.euclideanDistance(descriptor, storedDescriptor);
            if (dist < bestDistance) {
              bestDistance = dist;
              bestStudentId = student.student_id;
            }
          });
        });

        if (bestStudentId && bestDistance < distanceThreshold) {
          setDetectedStudentId(bestStudentId);

          if (
            bestStudentId !== lastMarkedRef.current &&
            !markedStudents.has(bestStudentId)
          ) {
            const student = lookup.get(bestStudentId);
            if (student) {
              onAttendanceMarked(bestStudentId, AttendanceStatus.PRESENT);
              lastMarkedRef.current = bestStudentId;
              toast.success(`Attendance marked for ${student.name}`);
            }
          }
        } else {
          setDetectedStudentId(null);
        }

        const dims = faceApi.matchDimensions(canvas, video, true);
        const resizedDetections = faceApi.resizeResults(detections, dims);
        faceApi.draw.drawDetections(canvas, resizedDetections);
      } catch {
        // Avoid spamming toasts on transient detection errors
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [
    isCameraActive,
    faceApi,
    descriptors,
    distanceThreshold,
    markedStudents,
    onAttendanceMarked,
    studentMap,
  ]);

  const detectedStudent = detectedStudentId
    ? studentMap().get(detectedStudentId)
    : null;

  if (isModelLoading || isLoadingDescriptors) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {isModelLoading
              ? 'Loading face recognition models...'
              : 'Loading enrolled faces...'}
          </p>
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
            <Badge variant="secondary">{descriptors.length} enrolled</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isCameraActive ? (
              <Button
                onClick={startCamera}
                className="gap-2"
                disabled={descriptors.length === 0}
              >
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

          {detectedStudent && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{detectedStudent.name}</span>
              <Badge variant="outline" className="text-xs">
                {detectedStudent.registration_number}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

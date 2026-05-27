"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Activity,
  Camera,
  Gauge,
  Loader2,
  Maximize2,
  Minimize2,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  useFaceAttendance,
  type FaceDescriptor,
} from "../hooks/useFaceAttendance";
import { AttendanceStatus } from "../types";
import { LiveAttendanceLog } from "./LiveAttendanceLog";
import { AttendanceSessionSummary } from "./AttendanceSessionSummary";
import { ManualOverrideSearch } from "./ManualOverrideSearch";
import { useAcademicSettings } from "@/hooks/use-settings";

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

type DetectionStatus =
  | "idle"
  | "searching"
  | "detected"
  | "matched"
  | "unknown";
type AttendanceMethod = "face" | "manual" | "barcode";

interface SessionEntry {
  id: string;
  student_id: string;
  studentName: string;
  registrationNumber: string;
  time: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
}

interface DetectionBox {
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

import { loadFaceApiModels } from '@/lib/face/load-models';

export function FaceAttendanceStation({
  sectionId,
  sectionName,
  onClose,
  students,
}: FaceAttendanceStationProps) {
  const t = useTranslations("faceAttendance.station");
  const tc = useTranslations("common");
  const { descriptors, markAttendance, logUnknownFace } = useFaceAttendance(sectionId);
  const { data: academicSettings } = useAcademicSettings();

  const getDetectionStatusLabel = (status: DetectionStatus) => {
    switch (status) {
      case "idle":
        return t("inactive");
      case "searching":
        return t("scanInstructions");
      case "detected":
        return t("faceRecognition");
      case "matched":
        return t("scanComplete");
      case "unknown":
        return t("faceNotRecognized");
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUnknownLogRef = useRef<number>(0);

  const [faceApi, setFaceApi] = useState<typeof import("face-api.js") | null>(
    null,
  );
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Recognition State
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([]);
  const [lastMarkedId, setLastMarkedId] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] =
    useState<DetectionStatus>("idle");
  const [matchConfidence, setMatchConfidence] = useState(0);

  // Marked students Set for fast lookup
  const markedStudentIds = useMemo(
    () => new Set(sessionEntries.map((e) => e.student_id)),
    [sessionEntries],
  );

  // Privacy acknowledgment check
  useEffect(() => {
    const acknowledged =
      localStorage.getItem("face-privacy-acknowledged") === "true";
    setPrivacyAcknowledged(acknowledged);
    if (!acknowledged) {
      setShowPrivacyNotice(true);
    }
  }, []);

  const handlePrivacyAcknowledge = () => {
    localStorage.setItem("face-privacy-acknowledged", "true");
    setPrivacyAcknowledged(true);
    setShowPrivacyNotice(false);
  };

  // Load Models
  useEffect(() => {
    loadFaceApiModels()
      .then((faceapi) => {
        setFaceApi(faceapi);
        setIsModelLoading(false);
      })
      .catch(() => {
        toast.error(t("loadModelsFailed"));
        setIsModelLoading(false);
      });
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
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setDetectionStatus("searching");
      }
    } catch {
      toast.error(t("cameraAccessFailed"));
    }
  }, [t, privacyAcknowledged]);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setDetectionStatus("idle");
  }, []);

  const handleMarkAttendance = useCallback(
    (
      studentId: string,
      name: string,
      reg: string,
      method: AttendanceMethod,
      confidence: number = 100,
      statusOverride?: AttendanceStatus,
    ) => {
      const now = new Date();
      const time = format(now, "HH:mm:ss");

      // Check for late arrival based on current time vs threshold from settings
      const lateArrivalTime = academicSettings?.late_arrival_time || "08:30";
      const [lateHour, lateMinute] = lateArrivalTime.split(":").map(Number);
      const isLate =
        now.getHours() > lateHour || 
        (now.getHours() === lateHour && now.getMinutes() > lateMinute);
      const status =
        statusOverride ??
        (isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT);

      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        student_id: studentId,
        studentName: name,
        registrationNumber: reg,
        time,
        status,
        method,
      };

      setSessionEntries((prev) => [newEntry, ...prev]);

      // Save to server
      markAttendance.mutate({
        studentId,
        sectionId,
        timestamp: now.toISOString(),
        confidence,
        method: "face_recognition",
      });

      if (method === "face") {
        toast.success(t("attendanceMarked"), {
          duration: 2000,
        });
      }
    },
    [markAttendance, sectionId, t, academicSettings],
  );

  // Main Detection Loop
  useEffect(() => {
    if (!isCameraActive || !faceApi || !videoRef.current || !canvasRef.current)
      return;

    let animationId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = {
      width: video.videoWidth || 640,
      height: video.videoHeight || 480,
    };
    faceApi.matchDimensions(canvas, displaySize);

    const runDetection = async () => {
      if (video.paused || video.ended) return;

      const detections = await faceApi
        .detectAllFaces(
          video,
          new faceApi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceApi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections.length > 0) {
        setDetectionStatus("detected");

        // Match logic
        const detection = resizedDetections[0];
        const descriptor = detection.descriptor;

        let bestMatch = { id: "", distance: 1.0 };

        // Compare with enrolled faces
        descriptors.forEach((student: FaceDescriptor) => {
          student.descriptors.forEach((storedDescriptor: number[]) => {
            const dist = faceApi.euclideanDistance(
              descriptor,
              storedDescriptor,
            );
            if (dist < bestMatch.distance) {
              bestMatch = { id: student.student_id, distance: dist };
            }
          });
        });

        // Similarity = 1 - distance. 0.6 distance is common threshold
        // Read confidence threshold from academic settings (percentage 0-100)
        // Convert to distance threshold: distance = 1 - (confidence / 100)
        const confidencePercent = academicSettings?.confidence_threshold ?? 60;
        const threshold = 1 - confidencePercent / 100;
        const confidence = Math.round((1 - bestMatch.distance) * 100);
        setMatchConfidence(confidence);

        if (bestMatch.distance < threshold) {
          setDetectionStatus("matched");

          if (
            bestMatch.id !== lastMarkedId &&
            !markedStudentIds.has(bestMatch.id)
          ) {
            const student = students.find((s) => s.id === bestMatch.id);
            if (student) {
              handleMarkAttendance(
                student.id,
                student.name,
                student.registration_number,
                "face",
                confidence,
              );
              setLastMarkedId(bestMatch.id);
            }
          }
        } else if (bestMatch.distance > 0.7) {
          setDetectionStatus("unknown");
          const nowMs = Date.now();
          if (nowMs - lastUnknownLogRef.current > 10000 && canvasRef.current) {
            lastUnknownLogRef.current = nowMs;
            logUnknownFace.mutate({
              sectionId,
              capturedImage: canvasRef.current.toDataURL("image/jpeg", 0.6),
              confidence,
            });
          }
        }

        // Custom Visual Overlay (Modern Box)
        resizedDetections.forEach((det: DetectionBox) => {
          const { x, y, width, height } = det.detection.box;
          if (ctx) {
            ctx.strokeStyle =
              detectionStatus === "matched" ? "#10b981" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            // Draw corners only for a premium look
            const len = 20;
            ctx.beginPath();
            ctx.moveTo(x, y + len);
            ctx.lineTo(x, y);
            ctx.lineTo(x + len, y);
            ctx.moveTo(x + width - len, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + len);
            ctx.moveTo(x + width, y + height - len);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + width - len, y + height);
            ctx.moveTo(x + len, y + height);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y + height - len);
            ctx.stroke();

            // Label
            if (detectionStatus === "matched") {
              const student = students.find((s) => s.id === bestMatch.id);
              if (student) {
                ctx.fillStyle = "#10b981";
                ctx.fillRect(x, y - 25, width, 25);
                ctx.fillStyle = "white";
                ctx.font = "bold 14px Inter, sans-serif";
                ctx.fillText(`${student.name} (${confidence}%)`, x + 5, y - 8);
              }
            }
          }
        });
      } else {
        setDetectionStatus("searching");
        setLastMarkedId(null);
      }

      animationId = requestAnimationFrame(runDetection);
    };

    runDetection();
    return () => cancelAnimationFrame(animationId);
  }, [
    isCameraActive,
    faceApi,
    descriptors,
    students,
    lastMarkedId,
    markedStudentIds,
    academicSettings?.confidence_threshold,
    detectionStatus,
    handleMarkAttendance,
    logUnknownFace,
    sectionId,
  ]);

  if (isModelLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl">
          <CardContent className="p-10 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
            <h2 className="text-xl font-bold mb-2">{t("processing")}</h2>
            <p className="text-muted-foreground text-center text-sm">
              {t("cameraPermissionDesc")}
            </p>
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
              <CardTitle>{t("cameraPermission")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("cameraPermissionDesc")}
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {tc("cancel")}
            </Button>
            <Button className="flex-1" onClick={handlePrivacyAcknowledge}>
              {tc("next")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const presentCount = sessionEntries.filter(
    (e) => e.status === AttendanceStatus.PRESENT,
  ).length;
  const lateCount = sessionEntries.filter(
    (e) => e.status === AttendanceStatus.LATE,
  ).length;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-background transition-colors",
        isFullscreen
          ? "fixed inset-0 z-[200] p-4"
          : "min-h-[calc(100vh-100px)] rounded-lg border p-4",
      )}
    >
      <header className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {t("title")}
              </h1>
              <Badge variant="outline" className="font-medium">
                {sectionName}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Real-time Visualizer */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="group relative flex-1 overflow-hidden rounded-lg border bg-muted shadow-sm">
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
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4">
              <Badge
                variant={isCameraActive ? "default" : "secondary"}
                className="rounded-md px-3 py-1.5 text-xs font-medium shadow-sm"
              >
                {isCameraActive ? t("active") : t("inactive")}
              </Badge>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-background/90 px-3 py-2 text-foreground shadow-sm backdrop-blur">
                  <Activity
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("attendanceStatus")}
                  </span>
                  <span className="text-xs font-medium">
                    {getDetectionStatusLabel(detectionStatus)}
                  </span>
                </div>
                {detectionStatus === "matched" && (
                  <div className="flex items-center gap-2 rounded-md border border-white/10 bg-background/90 px-3 py-2 text-foreground shadow-sm backdrop-blur">
                    <Gauge
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-muted-foreground">
                      {t("faceRecognition")}
                    </span>
                    <span className="text-xs font-medium">
                      {matchConfidence}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom HUD */}
            {isCameraActive && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <div className="flex gap-4">
                  <ManualOverrideSearch
                    students={students}
                    markedStudents={markedStudentIds}
                    onMark={(id, status) => {
                      const student = students.find((s) => s.id === id);
                      if (student)
                        handleMarkAttendance(
                          id,
                          student.name,
                          student.registration_number,
                          "manual",
                          100,
                          status,
                        );
                    }}
                    className="w-80"
                  />
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={stopCamera}
                    className="h-11 rounded-md px-8"
                  >
                    {tc("cancel")}
                  </Button>
                </div>
                <p className="text-white/50 text-xs flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  {t("cameraPermissionDesc")}
                </p>
              </div>
            )}

            {!isCameraActive && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 p-6 backdrop-blur-sm transition-colors">
                <Card className="w-full max-w-sm">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Camera className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {t("scanFace")}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {t("scanInstructions")}
                    </p>
                    <Button size="lg" onClick={startCamera} className="w-full">
                      {t("startSession")}
                    </Button>
                  </CardContent>
                </Card>
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
          <LiveAttendanceLog
            entries={sessionEntries}
            className="rounded-lg border"
          />
        </div>
      </div>
    </div>
  );
}

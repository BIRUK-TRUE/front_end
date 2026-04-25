"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ScanLine,
  Keyboard,
  CheckCircle2,
  XCircle,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { AttendanceStatus } from "../types";

interface BarcodeScannerProps {
  students: Array<{
    id: string;
    name: string;
    registration_number: string;
  }>;
  onAttendanceMarked: (studentId: string, status: AttendanceStatus) => void;
  markedStudents: Set<string>;
}

export function BarcodeScanner({
  students,
  onAttendanceMarked,
  markedStudents,
}: BarcodeScannerProps) {
  const tc = useTranslations("common");
  const [inputValue, setInputValue] = useState("");
  const [scanMode, setScanMode] = useState<"manual" | "camera">("manual");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<{
    name: string;
    regNum: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a lookup map for quick student finding
  const studentLookup = useRef(new Map<string, (typeof students)[0]>());

  useEffect(() => {
    const map = new Map<string, (typeof students)[0]>();
    students.forEach((s) => {
      map.set(s.registration_number.toLowerCase(), s);
      map.set(s.id, s);
    });
    studentLookup.current = map;
  }, [students]);

  // Process scanned code
  const processScan = useCallback(
    (code: string) => {
      const normalizedCode = code.toLowerCase().trim();
      const student = studentLookup.current.get(normalizedCode);

      if (!student) {
        toast.error(`${tc("noStudentsFound")}: ${code}`);
        return;
      }

      if (markedStudents.has(student.id)) {
        toast.info(`${student.name} ${tc("attendanceMarkedAsPresent")}`);
        setLastScanned({
          name: student.name,
          regNum: student.registration_number,
        });
        return;
      }

      onAttendanceMarked(student.id, AttendanceStatus.PRESENT);
      setLastScanned({
        name: student.name,
        regNum: student.registration_number,
      });
      toast.success(`${tc("submitAttendance")}: ${student.name}`);
    },
    [markedStudents, onAttendanceMarked],
  );

  // Focus input on mount
  useEffect(() => {
    if (scanMode === "manual") {
      inputRef.current?.focus();
    }
  }, [scanMode]);

  // Handle barcode scan (physical scanners send Enter key)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        processScan(inputValue.trim());
        setInputValue("");
      }
    },
    [inputValue, processScan],
  );

  // Global keyboard listener for physical barcode scanners
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input (except our scanner input)
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;

      // Barcode scanners typically send keys rapidly (< 50ms between keys)
      if (timeDiff > 100 && buffer.length > 0) {
        buffer = "";
      }

      lastKeyTime = currentTime;

      // Collect characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }

      // Enter key indicates end of barcode
      if (e.key === "Enter" && buffer.length > 2) {
        e.preventDefault();
        processScan(buffer);
        buffer = "";
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [processScan]);

  // Camera scanning (using native camera with manual capture)
  const startCameraScan = async () => {
    setIsScanning(true);
    // In production, integrate with a barcode scanning library
    // For now, we'll simulate with a prompt
    toast.info(tc("manualEntry"));
    setIsScanning(false);
    setScanMode("manual");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{tc("barcodeScan")}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setScanMode("manual")}
              className="gap-1"
            >
              <Keyboard className="h-3 w-3" />
              {tc("manualEntry")}
            </Button>
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              size="sm"
              onClick={() => setScanMode("camera")}
              className="gap-1"
            >
              <Camera className="h-3 w-3" />
              {tc("faceRecognition")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanMode === "manual" ? (
          <>
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tc("typeStudentRegistrationNumber")}
                className="h-12 text-lg font-mono"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ScanLine className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Use a barcode scanner or type the student ID and press Enter
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Camera preview would appear here
                </p>
                <Button
                  onClick={startCameraScan}
                  className="mt-4"
                  disabled={isScanning}
                >
                  {isScanning && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Start Scanning
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Last Scanned Status */}
        {lastScanned && (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-sm">{lastScanned.name}</p>
              <p className="text-xs text-muted-foreground">
                {lastScanned.regNum}
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-600 border-green-500/30"
            >
              Marked
            </Badge>
          </div>
        )}

        {/* Scan Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{markedStudents.size}</p>
            <p className="text-xs text-muted-foreground">Scanned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {students.length - markedStudents.size}
            </p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

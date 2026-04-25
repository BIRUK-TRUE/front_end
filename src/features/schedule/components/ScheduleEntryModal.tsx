"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { ScheduleEntry, CreateScheduleEntryPayload } from "../types";

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: CreateScheduleEntryPayload) => void;
  onDelete?: (id: string) => void;
  entry?: ScheduleEntry | null;
  sectionId: string;
  termId: string;
  existingEntries: ScheduleEntry[];
  subjects: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string }>;
}

const DAYS_OF_WEEK = [
  { value: 1, key: "monday" },
  { value: 2, key: "tuesday" },
  { value: 3, key: "wednesday" },
  { value: 4, key: "thursday" },
  { value: 5, key: "friday" },
  { value: 6, key: "saturday" },
];

const TIME_SLOTS = [
  "08:00",
  "08:45",
  "09:30",
  "10:15",
  "11:00",
  "11:45",
  "12:30",
  "13:15",
  "14:00",
  "14:45",
  "15:30",
  "16:15",
];

interface Conflict {
  type: "teacher" | "room" | "section";
  message: string;
  existingEntry: ScheduleEntry;
}

export function ScheduleEntryModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  entry,
  sectionId,
  termId,
  existingEntries,
  subjects,
  teachers,
}: ScheduleEntryModalProps) {
  const t = useTranslations("schedulePage");
  const tc = useTranslations("common");
  const isEditing = !!entry;

  const [formData, setFormData] = useState<CreateScheduleEntryPayload>({
    section_id: sectionId,
    subject_id: "",
    teacher_id: "",
    day_of_week: 1,
    start_time: "08:00",
    end_time: "08:45",
    room_number: "",
    term_id: termId,
  });

  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // Initialize form when editing
  useEffect(() => {
    if (entry) {
      setFormData({
        section_id: entry.section_id,
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time.slice(0, 5),
        end_time: entry.end_time.slice(0, 5),
        room_number: entry.room_number || "",
        term_id: entry.term_id,
      });
    } else {
      setFormData({
        section_id: sectionId,
        subject_id: "",
        teacher_id: "",
        day_of_week: 1,
        start_time: "08:00",
        end_time: "08:45",
        room_number: "",
        term_id: termId,
      });
    }
  }, [entry, sectionId, termId]);

  // Detect conflicts
  const detectConflicts = useMemo((): Conflict[] => {
    if (!formData.start_time || !formData.end_time) return [];

    const newStart = formData.start_time;
    const newEnd = formData.end_time;
    const newDay = formData.day_of_week;

    const foundConflicts: Conflict[] = [];

    for (const existing of existingEntries) {
      // Skip self when editing
      if (entry && existing.id === entry.id) continue;
      // Skip different days
      if (existing.day_of_week !== newDay) continue;

      const existingStart = existing.start_time.slice(0, 5);
      const existingEnd = existing.end_time.slice(0, 5);

      // Check time overlap
      const hasOverlap = newStart < existingEnd && newEnd > existingStart;
      if (!hasOverlap) continue;

      // Teacher conflict
      if (existing.teacher_id === formData.teacher_id && formData.teacher_id) {
        foundConflicts.push({
          type: "teacher",
          message: t("teacherConflictMessage", {
            teacher: existing.teacher_name,
            subject: existing.subject_name,
          }),
          existingEntry: existing,
        });
      }

      // Room conflict
      if (
        existing.room_number === formData.room_number &&
        formData.room_number
      ) {
        foundConflicts.push({
          type: "room",
          message: t("roomConflictMessage", {
            room: existing.room_number ?? formData.room_number ?? "",
            subject: existing.subject_name,
          }),
          existingEntry: existing,
        });
      }

      // Section conflict (same section, different entry)
      if (existing.section_id === sectionId) {
        foundConflicts.push({
          type: "section",
          message: t("sectionConflictMessage", {
            subject: existing.subject_name,
          }),
          existingEntry: existing,
        });
      }
    }

    return foundConflicts;
  }, [formData, existingEntries, entry, sectionId]);

  // Update conflicts when form changes
  useEffect(() => {
    setConflicts(detectConflicts);
  }, [detectConflicts]);

  const handleSubmit = () => {
    if (conflicts.length > 0) {
      toast.error(t("resolveConflictsFirst"));
      return;
    }

    if (!formData.subject_id || !formData.teacher_id) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    // Convert times to HH:mm:ss format
    const payload: CreateScheduleEntryPayload = {
      ...formData,
      start_time: `${formData.start_time}:00`,
      end_time: `${formData.end_time}:00`,
    };

    onSave(payload);
    onClose();
  };

  const handleDelete = () => {
    if (entry && onDelete) {
      onDelete(entry.id);
      onClose();
    }
  };

  const getConflictIcon = (type: Conflict["type"]) => {
    switch (type) {
      case "teacher":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "room":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "section":
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editScheduleEntry") : t("addScheduleEntry")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("editScheduleEntryDescription")
              : t("addScheduleEntryDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Day Selection */}
          <div className="space-y-2">
            <Label>{t("dayOfWeek")}</Label>
            <Select
              value={String(formData.day_of_week)}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, day_of_week: Number(v) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={String(day.value)}>
                    {t(day.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("startTime")}</Label>
              <Select
                value={formData.start_time}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, start_time: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("endTime")}</Label>
              <Select
                value={formData.end_time}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, end_time: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.filter((t) => t > formData.start_time).map(
                    (time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>{t("subject")}</Label>
            <Select
              value={formData.subject_id}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, subject_id: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectSubject")} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label>{t("teacher")}</Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, teacher_id: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectTeacher")} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <Label>{t("roomNumberOptional")}</Label>
            <Input
              value={formData.room_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  room_number: e.target.value,
                }))
              }
              placeholder={t("roomNumberPlaceholder")}
            />
          </div>

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-destructive">{t("conflictsDetected")}</Label>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20"
                  >
                    {getConflictIcon(conflict.type)}
                    <span className="text-sm text-destructive">
                      {conflict.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Conflicts */}
          {conflicts.length === 0 &&
            formData.subject_id &&
            formData.teacher_id && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {t("noConflictsDetected")}
                </span>
              </div>
            )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              {tc("delete")}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {tc("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              conflicts.length > 0 ||
              !formData.subject_id ||
              !formData.teacher_id
            }
          >
            {isEditing ? tc("save") : tc("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

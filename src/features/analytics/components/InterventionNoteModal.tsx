'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentRisk, Intervention } from "../types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAddInterventionNote, useUpdateIntervention, useDeleteIntervention } from "../hooks/useAtRiskStudents";
import { Loader2, MessageSquarePlus, Edit2, Trash2 } from "lucide-react";

interface InterventionNoteModalProps {
  student: StudentRisk;
  isOpen: boolean;
  onClose: () => void;
  intervention?: Intervention | null;
}

type InterventionType = 'counseling' | 'parent_meeting' | 'tutoring' | 'other';

export function InterventionNoteModal({ student, isOpen, onClose, intervention }: InterventionNoteModalProps) {
  const t = useTranslations("analytics.interventionNote");
  const [note, setNote] = useState(intervention?.note || "");
  const [interventionType, setInterventionType] = useState<InterventionType>(intervention?.type as InterventionType || 'counseling');

  const noteMutation = useAddInterventionNote();
  const updateMutation = useUpdateIntervention();
  const deleteMutation = useDeleteIntervention();

  const handleSave = async () => {
    if (!note.trim()) return;
    
    if (intervention) {
      await updateMutation.mutateAsync({
        id: intervention.id,
        note,
        type: interventionType
      });
    } else {
      await noteMutation.mutateAsync({
        studentId: student.studentId,
        note,
        type: interventionType
      });
    }
    setNote("");
    setInterventionType('counseling');
    onClose();
  };

  const handleDelete = async () => {
    if (intervention) {
      await deleteMutation.mutateAsync(intervention.id);
      setNote("");
      setInterventionType('counseling');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {intervention ? <Edit2 className="h-5 w-5 text-primary" /> : <MessageSquarePlus className="h-5 w-5 text-primary" />}
            {intervention ? t("editTitle") : t("title")}
          </DialogTitle>
          <DialogDescription>
            {intervention ? t("editDescription", { name: student.studentName }) : t("description", { name: student.studentName })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t("student")}</span>
                  <p className="text-sm font-bold">{student.studentName}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t("registration")}</span>
                  <p className="text-sm font-medium">{student.registrationNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">{t("interventionType")}</Label>
              <Select value={interventionType} onValueChange={(value: InterventionType) => setInterventionType(value)}>
                <SelectTrigger id="type" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counseling">{t("types.counseling")}</SelectItem>
                  <SelectItem value="parent_meeting">{t("types.parentMeeting")}</SelectItem>
                  <SelectItem value="tutoring">{t("types.tutoring")}</SelectItem>
                  <SelectItem value="other">{t("types.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">{t("note")}</Label>
              <Textarea
                id="note"
                placeholder={t("notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[150px] resize-none focus-visible:ring-primary border-muted-foreground/30"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {intervention && (
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("delete")}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={noteMutation.isPending || updateMutation.isPending || deleteMutation.isPending}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={noteMutation.isPending || updateMutation.isPending || deleteMutation.isPending || !note.trim()}
            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95"
          >
            {noteMutation.isPending || updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="mr-2 h-4 w-4" />
            )}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

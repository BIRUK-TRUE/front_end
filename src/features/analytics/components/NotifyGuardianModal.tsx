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
import { StudentRisk } from "../types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useNotifyGuardian } from "../hooks/useAtRiskStudents";
import { Loader2, Send } from "lucide-react";

interface NotifyGuardianModalProps {
  student: StudentRisk;
  isOpen: boolean;
  onClose: () => void;
}

export function NotifyGuardianModal({ student, isOpen, onClose }: NotifyGuardianModalProps) {
  const t = useTranslations("analytics.notifyGuardian");
  
  const [message, setMessage] = useState(
    t("defaultMessage", { studentName: student.studentName })
  );

  const notifyMutation = useNotifyGuardian();

  const handleSend = async () => {
    await notifyMutation.mutateAsync({
      studentId: student.studentId,
      message
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("subtitle") || "Send an intervention notification to the student's guardian."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">{t("studentName")}</Label>
              <p className="font-semibold">{student.studentName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">{t("guardianName")}</Label>
              <p className="font-semibold">{student.guardianInfo?.name || "N/A"}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs text-muted-foreground uppercase">{t("guardianPhone")}</Label>
              <p className="font-medium text-primary">{student.guardianInfo?.phone || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("message")}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none focus-visible:ring-primary"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={notifyMutation.isPending}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={notifyMutation.isPending || !student.guardianInfo}
            className="px-8 shadow-lg shadow-primary/20"
          >
            {notifyMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

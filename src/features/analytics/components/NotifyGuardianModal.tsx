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
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Send className="h-5 w-5 text-primary" /> {t("title")}
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
            {t("subtitle") || "Send an intervention notification to the student's guardian."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid gap-6 py-6 px-6">
            <div className="grid grid-cols-2 gap-6 bg-muted/30 p-5 rounded-2xl border border-muted-foreground/5">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t("studentName")}</Label>
                <p className="font-bold text-sm truncate" title={student.studentName}>{student.studentName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t("guardianName")}</Label>
                <p className="font-bold text-sm truncate" title={student.guardianInfo?.name || "N/A"}>{student.guardianInfo?.name || "N/A"}</p>
              </div>
              <div className="space-y-1 col-span-2 pt-2 border-t border-muted-foreground/10">
                <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t("guardianPhone")}</Label>
                <p className="font-black text-primary text-base tracking-tight">{student.guardianInfo?.phone || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="message" className="text-xs font-bold text-slate-700">{t("message")}</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[140px] rounded-2xl border-slate-200 shadow-sm focus:ring-primary/20 transition-all resize-none p-4 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 bg-slate-50 border-t shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={notifyMutation.isPending} className="rounded-xl h-11 px-6 font-bold">
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={notifyMutation.isPending || !student.guardianInfo}
            className="rounded-xl h-11 px-8 gap-2 font-black shadow-lg shadow-primary/20"
          >
            {notifyMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

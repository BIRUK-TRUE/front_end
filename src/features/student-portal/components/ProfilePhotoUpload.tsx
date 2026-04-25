"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfilePhoto } from "../api/useMyProfile";

export function ProfilePhotoUpload({
  currentPhotoUrl,
  studentName,
}: {
  currentPhotoUrl: string | null;
  studentName: string;
}) {
  const t = useTranslations("studentPortal.profile.photo");
  const updateMutation = useUpdateProfilePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initials = studentName.substring(0, 2).toUpperCase();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error(t("errorType"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("errorSize"));
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      await updateMutation.mutateAsync(formData);
      toast.success(t("success"));
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err) {
      toast.error(t("errorUpload"));
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <Avatar className="h-32 w-32 border-4 border-background shadow-sm mb-4">
          <AvatarImage src={previewUrl || currentPhotoUrl || ""} />
          <AvatarFallback className="text-3xl bg-muted">{initials}</AvatarFallback>
        </Avatar>
        
        {previewUrl ? (
          <div className="space-y-4 w-full">
            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">{t("preview")}</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                <X className="h-4 w-4 mr-1" />
                {t("cancel")}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t("uploading") : t("save")}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="mr-2 h-4 w-4" />
              {t("update")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

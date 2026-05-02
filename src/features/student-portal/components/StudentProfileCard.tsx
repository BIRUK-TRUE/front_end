import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";
import type { StudentProfile } from "../types";
import { useUpdateProfile } from "../api/useMyProfile";

export function StudentProfileCard({ profile }: { profile: StudentProfile }) {
  const t = useTranslations("studentPortal.profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    email: profile.email || '',
  });
  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    await updateProfile.mutateAsync(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      phone: profile.phone || '',
      email: profile.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("personalInfo.title")}</CardTitle>
              <CardDescription>{t("personalInfo.note")}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              disabled={updateProfile.isPending}
            >
              {isEditing ? t("cancel") : <Pencil className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-muted-foreground">{t("personalInfo.fullName")}</p>
              <p className="font-medium">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.studentId")}</p>
              <p className="font-medium">{profile.studentIdNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.dateOfBirth")}</p>
              <p className="font-medium">{format(new Date(profile.dateOfBirth), "PPP")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.gender")}</p>
              <p className="font-medium">{profile.gender}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.class")}</p>
              <p className="font-medium">{profile.className}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.section")}</p>
              <p className="font-medium">{profile.sectionName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.enrollmentDate")}</p>
              <p className="font-medium">{format(new Date(profile.enrollmentDate), "PPP")}</p>
            </div>
            <div>
              <Label htmlFor="phone">{t("personalInfo.phone")}</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-8"
                />
              ) : (
                <p className="font-medium">{profile.phone || t("personalInfo.notProvided")}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">{t("personalInfo.email")}</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-8"
                />
              ) : (
                <p className="font-medium">{profile.email || t("personalInfo.notProvided")}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                {t("cancel")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("guardian.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {t("guardian.noGuardian")}
            </p>
          ) : (
            <div className="space-y-4">
              {profile.guardians.map((g, idx) => (
                <div key={idx} className="border-b last:border-0 pb-4 last:pb-0 text-sm">
                  <p><span className="text-muted-foreground">{t("guardian.name")}:</span> <span className="font-medium">{g.fullName}</span></p>
                  <p><span className="text-muted-foreground">{t("guardian.relationship")}:</span> <span className="font-medium">{g.relationship}</span></p>
                  <p><span className="text-muted-foreground">{t("guardian.phone")}:</span> <span className="font-medium">{g.phone}</span></p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

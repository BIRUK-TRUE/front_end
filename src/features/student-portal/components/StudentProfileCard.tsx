import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { StudentProfile } from "../types";

export function StudentProfileCard({ profile }: { profile: StudentProfile }) {
  const t = useTranslations("studentPortal.profile");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("personalInfo.title")}</CardTitle>
          <CardDescription>{t("personalInfo.note")}</CardDescription>
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
              <p className="text-muted-foreground">{t("personalInfo.phone")}</p>
              <p className="font-medium">{profile.phone || t("personalInfo.notProvided")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("personalInfo.email")}</p>
              <p className="font-medium">{profile.email || t("personalInfo.notProvided")}</p>
            </div>
          </div>
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

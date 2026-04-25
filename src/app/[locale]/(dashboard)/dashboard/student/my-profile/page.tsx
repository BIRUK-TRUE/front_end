"use client";

import { useTranslations } from "next-intl";
import { useMyProfile } from "@/features/student-portal/api/useMyProfile";
import { StudentProfileCard } from "@/features/student-portal/components/StudentProfileCard";
import { ProfilePhotoUpload } from "@/features/student-portal/components/ProfilePhotoUpload";
import { ChangePasswordForm } from "@/features/student-portal/components/ChangePasswordForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MyProfilePage() {
  const tc = useTranslations("studentPortal.common");
  const t = useTranslations("studentPortal.profile");
  
  const { data, isLoading, isError, refetch } = useMyProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-6">
          <Skeleton className="h-64 w-1/3" />
          <Skeleton className="h-[400px] w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-destructive mb-4">{tc("error")}</p>
        <Button onClick={() => refetch()} variant="outline">{tc("retry")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 space-y-6">
          <ProfilePhotoUpload 
            currentPhotoUrl={data.photoUrl} 
            studentName={data.fullName}
          />
          <ChangePasswordForm />
        </div>
        <div className="w-full lg:w-2/3">
          <StudentProfileCard profile={data} />
        </div>
      </div>
    </div>
  );
}

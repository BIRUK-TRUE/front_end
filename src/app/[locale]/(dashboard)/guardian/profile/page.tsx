"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Shield, Users, Lock, ChevronRight } from "lucide-react";
import { useMyChildren } from "@/features/guardian-portal/hooks/useMyChildren";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function GuardianProfilePage() {
  const t = useTranslations("guardianPortal.profile");
  const tc = useTranslations("common");
  const { user } = useAuthStore();
  const { data: children, isLoading } = useMyChildren();

  if (!user) return null;

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {/* Personal Information */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t("personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarImage src={user.profile_image_url ?? ""} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary uppercase">
                    {user.full_name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold">{user.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{t("systemGuardianRecord")}</p>
                  <Badge variant="outline" className="mt-2 bg-primary/5 text-primary border-primary/20">
                    {t("verifiedAccount")}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={user.email} readOnly className="pl-10 bg-muted/50 cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    {t("phone")}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={user.phone_number ?? t("notProvided")} readOnly className="pl-10 bg-muted/50 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Children */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("linkedChildren")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : children && children.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {children.map((child) => (
                    <Link 
                      key={child.id} 
                      href={`/guardian/children/${child.id}`}
                      className="group flex items-center gap-4 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/[0.02] transition-all"
                    >
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={child.photoUrl ?? ""} />
                        <AvatarFallback className="text-[10px] font-bold">
                          {child.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {child.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate italic">
                          {child.className} - {child.sectionName}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-6 text-muted-foreground italic">
                  {t("noChildrenLinked")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Security / Password */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t("changePassword")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("currentPassword")}
                </Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("newPassword")}
                </Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("confirmPassword")}
                </Label>
                <Input id="confirm" type="password" />
              </div>
              <Button className="w-full mt-2 font-bold shadow-sm">{t("updatePassword")}</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-primary/[0.01] border-dashed">
            <CardContent className="pt-6 text-center space-y-2">
              <Shield className="h-8 w-8 text-primary/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                {t("securityNote")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

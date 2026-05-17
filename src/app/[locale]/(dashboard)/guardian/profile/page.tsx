"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  Mail,
  Shield,
  Users,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMyChildren } from "@/features/guardian-portal/hooks/useMyChildren";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { authService } from "@/lib/api/auth.service";

export default function GuardianProfilePage() {
  const t = useTranslations("guardianPortal.profile");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const { user } = useAuthStore();
  const { data: children, isLoading } = useMyChildren();

  const passwordSchema = z
    .object({
      current_password: z.string().min(1, tv("required")),
      new_password: z.string().min(8, tv("passwordMinLength")),
      confirm_password: z.string().min(1, tv("required")),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: tv("passwordsDoNotMatch"),
      path: ["confirm_password"],
    });

  type PasswordForm = z.infer<typeof passwordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authService.changePassword(
        data.current_password,
        data.new_password,
        data.confirm_password,
      );
      toast.success(t("passwordChanged"));
      reset();
    } catch (error: any) {
      toast.error(formatApiError(error, t("changePasswordFailed")));
    }
  };

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
                  <p className="text-sm text-muted-foreground">
                    {t("systemGuardianRecord")}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 bg-primary/5 text-primary border-primary/20"
                  >
                    {t("verifiedAccount")}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold uppercase text-muted-foreground tracking-wider"
                  >
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      readOnly
                      className="pl-10 bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-bold uppercase text-muted-foreground tracking-wider"
                  >
                    {t("phone")}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={user.phone_number ?? t("notProvided")}
                      readOnly
                      className="pl-10 bg-muted/50 cursor-not-allowed"
                    />
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
              <form
                onSubmit={handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="current"
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("currentPassword")}
                  </Label>
                  <Input
                    id="current"
                    type="password"
                    {...register("current_password")}
                    aria-invalid={!!errors.current_password}
                    className="h-11"
                  />
                  {errors.current_password && (
                    <p
                      className="text-sm text-destructive flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.current_password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new"
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("newPassword")}
                  </Label>
                  <Input
                    id="new"
                    type="password"
                    {...register("new_password")}
                    aria-invalid={!!errors.new_password}
                    className="h-11"
                  />
                  {errors.new_password && (
                    <p
                      className="text-sm text-destructive flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.new_password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm"
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("confirmPassword")}
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    {...register("confirm_password")}
                    aria-invalid={!!errors.confirm_password}
                    className="h-11"
                  />
                  {errors.confirm_password && (
                    <p
                      className="text-sm text-destructive flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full mt-2 font-bold shadow-sm min-h-[44px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tc("loading")}
                    </>
                  ) : (
                    t("updatePassword")
                  )}
                </Button>
              </form>
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

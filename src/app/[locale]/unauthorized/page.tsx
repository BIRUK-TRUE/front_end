"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const t = useTranslations("auth.unauthorized");
  const { user } = useAuthStore();

  const userRole = user?.roles?.[0] || "guest";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full text-center space-y-6 bg-background p-8 rounded-2xl shadow-xl border border-border/50 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("message")}
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg text-sm flex items-center justify-center gap-2">
           <span className="font-semibold">{t("yourRole", { role: userRole })}</span>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full h-12 shadow-md">
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" /> {t("goToDashboard")}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full h-12">
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Back Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

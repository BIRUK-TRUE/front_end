"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="h-5 w-5" />,
        info: <InfoIcon className="h-5 w-5" />,
        warning: <TriangleAlertIcon className="h-5 w-5" />,
        error: <OctagonXIcon className="h-5 w-5" />,
        loading: <Loader2Icon className="h-5 w-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg":
            "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(250,250,252,0.75))",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "rgba(0,0,0,0.06)",
          "--border-radius": "calc(var(--radius) + 4px)",
          "--success-bg":
            "linear-gradient(90deg, rgba(56,189,248,0.12), rgba(16,185,129,0.08))",
          "--error-bg":
            "linear-gradient(90deg, rgba(254,202,202,0.08), rgba(254,99,99,0.06))",
          "--warning-bg":
            "linear-gradient(90deg, rgba(255,246,205,0.08), rgba(250,204,21,0.06))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

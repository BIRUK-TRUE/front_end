"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesService } from "@/lib/api/roles.service";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  });
}

export function useAvailablePermissions() {
  return useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: rolesService.getAvailablePermissions,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  
  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      rolesService.updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(t("saved") || "Permissions updated successfully");
    },
    onError: () => {
      toast.error(t("saveFailed") || "Failed to update permissions");
    },
  });
}

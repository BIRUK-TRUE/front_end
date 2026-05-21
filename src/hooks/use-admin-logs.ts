"use client";

import { useQuery } from "@tanstack/react-query";
import { adminLogsService, type AdminLogFilters } from "@/lib/api/admin-logs.service";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminLogs(filters: AdminLogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.adminLogs.list(filters),
    queryFn: () => adminLogsService.getAll(filters),
  });
}

export function useAdminLog(id: string) {
  return useQuery({
    queryKey: queryKeys.adminLogs.detail(id),
    queryFn: () => adminLogsService.getById(id),
    enabled: !!id,
  });
}

export function useActionTypes() {
  return useQuery({
    queryKey: queryKeys.adminLogs.actionTypes,
    queryFn: () => adminLogsService.getActionTypes(),
  });
}

export function useResourceTypes() {
  return useQuery({
    queryKey: queryKeys.adminLogs.resourceTypes,
    queryFn: () => adminLogsService.getResourceTypes(),
  });
}

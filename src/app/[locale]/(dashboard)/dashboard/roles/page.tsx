"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  Users, 
  Lock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useRoles, useAvailablePermissions, useUpdateRolePermissions } from "@/hooks/use-roles";



export default function RolesPage() {
  const t = useTranslations("roles");
  const tc = useTranslations("common");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Fetch data from API
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: availablePermissions, isLoading: permissionsLoading } = useAvailablePermissions();
  const updatePermissions = useUpdateRolePermissions();

  const selectedRoleData = roles?.find(r => r.id === selectedRole);

  const togglePermission = (roleId: string, permissionId: string) => {
    if (!selectedRoleData) return;
    
    const hasPermission = selectedRoleData.permissions.includes(permissionId);
    const newPermissions = hasPermission
      ? selectedRoleData.permissions.filter(p => p !== permissionId)
      : [...selectedRoleData.permissions, permissionId];
    
    // Optimistic update - update UI immediately
    const updatedRoles = roles?.map(role => {
      if (role.id === roleId) {
        return { ...role, permissions: newPermissions };
      }
      return role;
    });
    
    // Call API to persist changes
    updatePermissions.mutate({ roleId, permissions: newPermissions });
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const role = roles?.find(r => r.id === roleId);
    return role?.permissions.includes(permissionId) || false;
  };

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    if (!availablePermissions) return {};
    
    return availablePermissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof availablePermissions>);
  }, [availablePermissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("roles")}</CardTitle>
              <CardDescription>{t("rolesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {rolesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                roles?.map((role) => {
                  const Icon = Shield; // Use Shield as default icon for all roles
                  return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                      selectedRole === role.id ? "border-primary bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.userCount} users
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{role.permissions.length} perms</Badge>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
          </Card>
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-2">
          {selectedRoleData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedRoleData.name}
                      <Badge className={selectedRoleData.color}>
                        {selectedRoleData.id}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedRoleData.description}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updatePermissions.mutate({ 
                      roleId: selectedRoleData.id, 
                      permissions: selectedRoleData.permissions 
                    })}
                    disabled={updatePermissions.isPending}
                  >
                    {updatePermissions.isPending ? tc("saving") : tc("save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {permissionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{category}</h3>
                      <Badge variant="secondary">{perms.length}</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {perms.map((perm) => {
                        const enabled = hasPermission(selectedRoleData.id, perm.id);
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-2">
                              {enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Label className="cursor-pointer text-sm font-medium">
                                {perm.name}
                              </Label>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={() => togglePermission(selectedRoleData.id, perm.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
                )}

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Permission Changes</p>
                      <p className="text-muted-foreground">
                        Changes will affect all users with this role immediately. 
                        Some permissions may require a page refresh to take effect.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("selectRole")}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Select a role from the list to view and edit its permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Lock, 
  Unlock,
  CheckCircle,
  XCircle
} from "lucide-react";

// Define available permissions
const AVAILABLE_PERMISSIONS = [
  { id: "users:view", name: "View Users", category: "User Management" },
  { id: "users:create", name: "Create Users", category: "User Management" },
  { id: "users:edit", name: "Edit Users", category: "User Management" },
  { id: "users:delete", name: "Delete Users", category: "User Management" },
  { id: "students:view", name: "View Students", category: "Student Management" },
  { id: "students:create", name: "Create Students", category: "Student Management" },
  { id: "students:edit", name: "Edit Students", category: "Student Management" },
  { id: "students:delete", name: "Delete Students", category: "Student Management" },
  { id: "teachers:view", name: "View Teachers", category: "Teacher Management" },
  { id: "teachers:create", name: "Create Teachers", category: "Teacher Management" },
  { id: "teachers:edit", name: "Edit Teachers", category: "Teacher Management" },
  { id: "payments:view", name: "View Payments", category: "Financial" },
  { id: "payments:create", name: "Create Payments", category: "Financial" },
  { id: "payments:export", name: "Export Payments", category: "Financial" },
  { id: "reports:view", name: "View Reports", category: "Reports" },
  { id: "reports:export", name: "Export Reports", category: "Reports" },
  { id: "settings:manage", name: "Manage Settings", category: "System" },
  { id: "logs:view", name: "View Admin Logs", category: "System" },
];

// Default role configurations
const DEFAULT_ROLES = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    icon: Shield,
    color: "bg-red-100 text-red-800",
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    userCount: 2,
  },
  {
    id: "director",
    name: "Director",
    description: "School director with broad management access",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
    permissions: [
      "users:view", "users:create", "users:edit",
      "students:view", "students:create", "students:edit", "students:delete",
      "teachers:view", "teachers:create", "teachers:edit",
      "payments:view", "payments:create", "payments:export",
      "reports:view", "reports:export",
      "logs:view",
    ],
    userCount: 5,
  },
  {
    id: "registrar",
    name: "Registrar",
    description: "Manages student enrollment and records",
    icon: Users,
    color: "bg-green-100 text-green-800",
    permissions: [
      "users:view",
      "students:view", "students:create", "students:edit",
      "teachers:view",
      "payments:view", "payments:create",
      "reports:view",
    ],
    userCount: 8,
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Teaching staff with classroom access",
    icon: Users,
    color: "bg-purple-100 text-purple-800",
    permissions: [
      "students:view",
      "teachers:view",
      "reports:view",
    ],
    userCount: 85,
  },
  {
    id: "student",
    name: "Student",
    description: "Student portal access",
    icon: Users,
    color: "bg-yellow-100 text-yellow-800",
    permissions: [
      "students:view",
    ],
    userCount: 1250,
  },
  {
    id: "guardian",
    name: "Guardian",
    description: "Parent/guardian access to child information",
    icon: Users,
    color: "bg-orange-100 text-orange-800",
    permissions: [
      "students:view",
      "payments:view",
    ],
    userCount: 980,
  },
];

export default function RolesPage() {
  const t = useTranslations("roles");
  const tc = useTranslations("common");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roles, setRoles] = useState(DEFAULT_ROLES);

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId],
        };
      }
      return role;
    }));
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissions.includes(permissionId) || false;
  };

  // Group permissions by category
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

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
              {roles.map((role) => {
                const Icon = role.icon;
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
              })}
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
                  <Button variant="outline" size="sm">
                    {tc("save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
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
                ))}

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

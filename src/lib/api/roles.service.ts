import { axiosInstance } from './axios';

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color?: string;
}

export interface PermissionConfig {
  id: string;
  name: string;
  category: string;
}

export const rolesService = {
  getRoles: async (): Promise<RoleConfig[]> => {
    const response = await axiosInstance.get('/roles/');
    return response.data;
  },

  getRole: async (roleId: string): Promise<RoleConfig> => {
    const response = await axiosInstance.get(`/roles/${roleId}`);
    return response.data;
  },

  updateRolePermissions: async (roleId: string, permissions: string[]) => {
    const response = await axiosInstance.patch(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },

  getAvailablePermissions: async (): Promise<PermissionConfig[]> => {
    const response = await axiosInstance.get('/roles/available-permissions');
    return response.data;
  },
};

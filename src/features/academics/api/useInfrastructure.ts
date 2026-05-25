import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { type Building, type Classroom, type PaginatedResponse } from "../types";
import { type BuildingForm, type ClassroomForm } from "../types/schemas";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

export const infrastructureKeys = {
  all: ["infrastructure"] as const,
  buildings: {
    all: () => [...infrastructureKeys.all, "buildings"] as const,
    list: (filters: object) =>
      [...infrastructureKeys.buildings.all(), "list", filters] as const,
    detail: (id: string) =>
      [...infrastructureKeys.buildings.all(), "detail", id] as const,
  },
  classrooms: {
    all: () => [...infrastructureKeys.all, "classrooms"] as const,
    list: (filters: object) =>
      [...infrastructureKeys.classrooms.all(), "list", filters] as const,
    byBuilding: (buildingId: string) =>
      [...infrastructureKeys.classrooms.all(), "building", buildingId] as const,
    detail: (id: string) =>
      [...infrastructureKeys.classrooms.all(), "detail", id] as const,
  },
};

// --- BUILDINGS ---

export const useBuildings = (page = 1, size = 50) => {
  return useQuery({
    queryKey: infrastructureKeys.buildings.list({ page, size }),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Building>>(
        "/academics/buildings",
        { params: { page, size } }
      );
      return data;
    },
  });
};

export const useBuilding = (buildingId: string) => {
  return useQuery({
    queryKey: infrastructureKeys.buildings.detail(buildingId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Building>(
        `/academics/buildings/${buildingId}`
      );
      return data;
    },
    enabled: !!buildingId,
  });
};

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BuildingForm) => {
      const { data } = await axiosInstance.post("/academics/buildings", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.buildings.all(),
      });
      toast.success("Building created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create building"));
    },
  });
};

export const useUpdateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BuildingForm>;
    }) => {
      const response = await axiosInstance.patch(
        `/academics/buildings/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.buildings.all(),
      });
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.buildings.detail(variables.id),
      });
      toast.success("Building updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update building"));
    },
  });
};

export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/buildings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.buildings.all(),
      });
      toast.success("Building deleted successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete building"));
    },
  });
};

// --- CLASSROOMS ---

export const useClassrooms = (buildingId?: string, page = 1, size = 50) => {
  return useQuery({
    queryKey: buildingId
      ? infrastructureKeys.classrooms.byBuilding(buildingId)
      : infrastructureKeys.classrooms.list({ page, size }),
    queryFn: async () => {
      const url = buildingId
        ? `/academics/buildings/${buildingId}/classrooms`
        : "/academics/classrooms";
      const { data } = await axiosInstance.get<PaginatedResponse<Classroom>>(
        url,
        { params: { page, size } }
      );
      return data;
    },
    enabled: true,
  });
};

export const useClassroom = (classroomId: string) => {
  return useQuery({
    queryKey: infrastructureKeys.classrooms.detail(classroomId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Classroom>(
        `/academics/classrooms/${classroomId}`
      );
      return data;
    },
    enabled: !!classroomId,
  });
};

export const useCreateClassroom = (buildingId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClassroomForm) => {
      const url = buildingId
        ? `/academics/buildings/${buildingId}/classrooms`
        : "/academics/classrooms";
      const { data } = await axiosInstance.post(url, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.classrooms.all(),
      });
      if (variables.building_id) {
        queryClient.invalidateQueries({
          queryKey: infrastructureKeys.classrooms.byBuilding(
            variables.building_id
          ),
        });
      }
      toast.success("Classroom created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create classroom"));
    },
  });
};

export const useUpdateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClassroomForm>;
    }) => {
      const response = await axiosInstance.patch(
        `/academics/classrooms/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.classrooms.all(),
      });
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.classrooms.detail(variables.id),
      });
      toast.success("Classroom updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update classroom"));
    },
  });
};

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/classrooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: infrastructureKeys.classrooms.all(),
      });
      toast.success("Classroom deleted successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete classroom"));
    },
  });
};

import { apiClient } from '@/shared/config/axios';
import type { CreateProjectInput, Project, UpdateProjectInput } from '../types';

export const projectsApi = {
  getAll: async (params?: {
    q?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectInput): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  inviteMember: async (projectId: string, email: string) => {
    const response = await apiClient.post(`/projects/${projectId}/members`, { email });
    return response.data;
  },

  updateRole: async (projectId: string, memberId: string, role: string) => {
    const response = await apiClient.patch(`/projects/${projectId}/members/${memberId}`, { role });
    return response.data;
  },

  removeMember: async (projectId: string, memberId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  },

  getAllUsers: async (): Promise<
    { id: string; name: string; email: string; avatar: string | null }[]
  > => {
    const response = await apiClient.get('/users');
    return response.data;
  },
};

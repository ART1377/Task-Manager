'use client';

import { apiClient } from '@/shared/config/axios';
import { queryKeys } from '@/shared/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

interface Member {
  id: string;
  user: { id: string; name: string; avatar: string | null };
  role: string;
}

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId || ''),
    queryFn: async () => {
      if (!projectId) return [];
      const res = await apiClient.get<Member[]>(`/projects/${projectId}/members`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

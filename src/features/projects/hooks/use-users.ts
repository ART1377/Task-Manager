'use client';

import { queryKeys } from '@/shared/lib/query-keys';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects-api';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: projectsApi.getAllUsers,
    staleTime: 60 * 1000,
  });
}

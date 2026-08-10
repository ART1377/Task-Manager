'use client';

import { useMutationWithToast } from '@/shared/hooks/use-mutation-with-toast';
import { useOptimisticMutation } from '@/shared/hooks/use-optimistic-mutation';
import { queryKeys } from '@/shared/lib/query-keys';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks-api';
import type { Task, UpdateTaskInput } from '../types';

interface UseTasksFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useTasks(filters: UseTasksFilters = {}) {
  const { projectId, ...restFilters } = filters;

  const tasksQuery = useQuery({
    queryKey: projectId
      ? queryKeys.tasks.byProject(projectId, restFilters)
      : queryKeys.tasks.list(restFilters),
    queryFn: () => tasksApi.getAll(filters),
  });

  // Mutations should invalidate all task queries, regardless of filters
  const createTaskMutation = useMutationWithToast({
    mutationFn: tasksApi.create,
    queryKey: queryKeys.tasks.all,
    successMessage: 'تسک با موفقیت ایجاد شد',
    errorMessage: 'خطا در ایجاد تسک',
  });

  const updateTaskMutation = useOptimisticMutation<Task, { id: string; data: UpdateTaskInput }>({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    queryKey: queryKeys.tasks.all,
    successMessage: 'تسک به‌روزرسانی شد',
    errorMessage: 'خطا در به‌روزرسانی تسک',
    onOptimisticUpdate: (oldData, { id, data }) => {
      if (!oldData) return [];
      return oldData.map((task) => (task.id === id ? { ...task, ...data } : task));
    },
  });

  const deleteTaskMutation = useMutationWithToast({
    mutationFn: tasksApi.delete,
    queryKey: queryKeys.tasks.all,
    successMessage: 'تسک حذف شد',
    errorMessage: 'خطا در حذف تسک',
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    createTask: createTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutate,
    isUpdating: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutate,
    isDeleting: deleteTaskMutation.isPending,
  };
}

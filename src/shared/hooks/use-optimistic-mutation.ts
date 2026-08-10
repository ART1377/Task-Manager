import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface OptimisticUpdateConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  successMessage?: string;
  errorMessage?: string;
  onOptimisticUpdate?: (oldData: TData[] | undefined, variables: TVariables) => TData[];
}

export function useOptimisticMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  queryKey,
  successMessage,
  errorMessage = 'خطا در انجام عملیات',
  onOptimisticUpdate,
}: OptimisticUpdateConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onMutate: async (variables) => {
      // Cancel all queries matching this key pattern
      await queryClient.cancelQueries({ queryKey });

      // Store previous data for rollback
      const previousData = queryClient.getQueriesData<TData[]>({ queryKey, exact: false });

      if (onOptimisticUpdate) {
        // Update all matching caches
        queryClient.setQueriesData<TData[]>({ queryKey, exact: false }, (old) =>
          onOptimisticUpdate(old, variables)
        );
      }

      return { previousData };
    },

    onError: (err, variables, context) => {
      // Rollback all matching caches
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(errorMessage);
    },

    onSuccess: () => {
      if (successMessage) {
        toast.success(successMessage);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey, exact: false });
    },
  });
}

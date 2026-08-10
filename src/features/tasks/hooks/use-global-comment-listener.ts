'use client';

import { queryKeys } from '@/shared/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';
import { useEffect } from 'react';
import type { Task, TaskComment } from '../types';

/**
 * Listens for comment:new events globally via Pusher and updates
 * task comment counts in the cache, regardless of which sheet is open.
 * Mount this once at the kanban board level.
 */
export function useGlobalCommentListener() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const handleComment = (data: { taskId: string; comment: TaskComment }) => {
      // Update comment count on the task card across all task queries
      queryClient.setQueriesData<Task[]>({ queryKey: queryKeys.tasks.all, exact: false }, (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === data.taskId
            ? {
                ...task,
                _count: {
                  ...task._count,
                  comments: (task._count?.comments ?? 0) + 1,
                },
              }
            : task
        );
      });
    };

    // We need to know which project channels to listen to
    // Listen on a global channel for all comment events
    const channel = pusher.subscribe('global-comments');
    channel.bind('comment:new', handleComment);

    return () => {
      channel.unbind('comment:new', handleComment);
      pusher.unsubscribe('global-comments');
      pusher.disconnect();
    };
  }, [queryClient, session?.user?.id]);
}

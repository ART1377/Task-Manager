'use client';

import { getPusherClient } from '@/shared/lib/pusher-client';
import { queryKeys } from '@/shared/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function usePusherNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`private-user-${session.user.id}`);

    const handler = (data: any) => {
      toast(data.message, { icon: '🔔', duration: 5000 });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread });
    };

    channel.bind('notification', handler);

    return () => {
      channel.unbind('notification', handler);
      pusher.unsubscribe(`private-user-${session.user.id}`);
    };
  }, [session?.user?.id, queryClient]);
}

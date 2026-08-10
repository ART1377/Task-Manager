'use client';

import { queryKeys } from '@/shared/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface SSENotificationEvent {
  type: 'notification';
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, string>;
    createdAt: string;
  };
}

export function useSSE() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!session?.user?.id) return;
    if (eventSourceRef.current) return;

    const es = new EventSource('/api/notifications/sse');

    es.onmessage = (event) => {
      try {
        // Ignore heartbeats
        if (!event.data || event.data.startsWith(':')) return;

        const data: SSENotificationEvent = JSON.parse(event.data);

        if (data.type === 'notification') {
          // Show toast
          toast(data.notification.message, {
            icon: '🔔',
            duration: 5000,
          });

          // Invalidate notifications cache
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.all,
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.unread,
          });
        }
      } catch {
        // Ignore parse errors (heartbeats, etc.)
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;

      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    es.onopen = () => {
      console.log('[SSE] Connected');
    };

    eventSourceRef.current = es;
  }, [session?.user?.id, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}

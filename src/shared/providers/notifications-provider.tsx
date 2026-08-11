'use client';

import { usePusherNotifications } from '@/features/notifications/hooks/use-pusher-notifications';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  usePusherNotifications();
  return <>{children}</>;
}

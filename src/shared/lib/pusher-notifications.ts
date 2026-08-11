import { pusherServer } from './pusher-server';

export async function sendPusherNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, string>;
  }
) {
  await pusherServer.trigger(`private-user-${userId}`, 'notification', {
    ...notification,
    createdAt: new Date().toISOString(),
  });
}

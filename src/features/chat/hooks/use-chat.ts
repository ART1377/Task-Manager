'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useMutationWithToast } from '@/shared/hooks/use-mutation-with-toast';
import { queryKeys } from '@/shared/lib/query-keys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { chatApi } from '../api/chat-api';
import type { ChatMessage, ChatRoom, ReplyInfo, RoomUpdatedPayload } from '../types';
import { useChatAPI } from './use-chat-api';
import { useChatPusher } from './use-chat-pusher';
import { useForwardMessage } from './use-forward-message';
import { useReadReceipts } from './use-read-receipts';

function createClientId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function useChat(roomId: string) {
  const { user } = useAuth();
  const api = useChatAPI(roomId);
  const pusher = useChatPusher(roomId);
  const { forwardMessage } = useForwardMessage();
  const readReceipts = useReadReceipts(roomId);

  const [pending, setPending] = useState<Map<string, ChatMessage>>(new Map());

  // Remove pending messages when confirmed broadcast arrives
  useEffect(() => {
    if (pusher.liveMessages.length === 0 || pending.size === 0) return;

    setPending((prev) => {
      let changed = false;
      const next = new Map(prev);

      for (const msg of pusher.liveMessages) {
        if (msg.clientId && next.has(msg.clientId)) {
          next.delete(msg.clientId);
          changed = true;
          continue;
        }

        for (const [key, pendingMsg] of next) {
          if (
            pendingMsg.content === msg.content &&
            pendingMsg.senderId === msg.senderId &&
            Math.abs(new Date(pendingMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) <
              10000
          ) {
            next.delete(key);
            changed = true;
            break;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [pusher.liveMessages, pending.size]);

  // Merge: API history + live pusher messages + pending optimistic - deleted
  const messages = useMemo(() => {
    const historyIds = new Set(api.messages.map((m) => m.id));
    const live = pusher.liveMessages.filter(
      (m) => !historyIds.has(m.id) && !pusher.deletedMessageIds.has(m.id)
    );
    const merged = [...api.messages, ...live]
      .filter((m) => !pusher.deletedMessageIds.has(m.id))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return [...merged, ...pending.values()];
  }, [api.messages, pusher.liveMessages, pusher.deletedMessageIds, pending]);

  const othersTyping = useMemo(
    () => pusher.typingUsers.filter((u) => u.userId !== user?.id),
    [pusher.typingUsers, user?.id]
  );

  // NOTE: read-receipt marking is intentionally NOT done here as a blanket
  // "mark everything as read" effect anymore — that only ran once per room
  // (both because of a permanently-flipped ref guard AND a dependency on
  // `messages.length > 0`, a boolean that stops changing after the first
  // message, so it never re-fired for messages that arrived later over
  // Pusher). Real read-tracking now happens via `readReceipts.registerMessageElement`,
  // wired to each message bubble's DOM node in ChatMessages/MessageBubble —
  // a message is marked read only once it's actually scrolled into view,
  // which also means it keeps working for messages that arrive live while
  // the room is already open, without needing a reload.

  const sendMessage = async (content: string, replyTo?: ReplyInfo) => {
    const trimmed = content.trim();
    if (!trimmed || !user) return;

    const clientId = createClientId();
    const optimisticMessage: ChatMessage = {
      id: clientId,
      clientId,
      roomId,
      senderId: user.id as string,
      content: trimmed,
      replyToId: replyTo?.id ?? null,
      replyTo: replyTo ?? null,
      createdAt: new Date().toISOString(),
      sender: { id: user.id as string, name: user.name || '', avatar: user.image || null },
      status: 'sending',
    };

    setPending((prev) => new Map(prev).set(clientId, optimisticMessage));

    chatApi
      .sendMessage(roomId, trimmed, replyTo?.id)
      .then(() => {
        setPending((prev) => {
          const next = new Map(prev);
          next.delete(clientId);
          return next;
        });
      })
      .catch(() => {
        setPending((prev) => {
          const next = new Map(prev);
          const failed = next.get(clientId);
          if (failed) next.set(clientId, { ...failed, status: 'failed' });
          return next;
        });
      });
  };

  const retryMessage = (clientId: string) => {
    const failed = pending.get(clientId);
    if (!failed || !user) return;
    setPending((prev) => new Map(prev).set(clientId, { ...failed, status: 'sending' }));

    chatApi
      .sendMessage(roomId, failed.content, failed.replyToId ?? undefined)
      .then(() => {
        setPending((prev) => {
          const next = new Map(prev);
          next.delete(clientId);
          return next;
        });
      })
      .catch(() => {
        setPending((prev) => {
          const next = new Map(prev);
          const f = next.get(clientId);
          if (f) next.set(clientId, { ...f, status: 'failed' });
          return next;
        });
      });
  };

  const deleteMessageWithToast = useCallback(
    async (messageId: string) => {
      try {
        await chatApi.deleteMessage(roomId, messageId);
        toast.success('پیام حذف شد');
      } catch {
        toast.error('خطا در حذف پیام');
      }
    },
    [roomId]
  );

  const updateMessageWithToast = useCallback(
    async (messageId: string, content: string) => {
      try {
        await chatApi.updateMessage(roomId, messageId, content);
        toast.success('پیام ویرایش شد');
      } catch {
        toast.error('خطا در ویرایش پیام');
      }
    },
    [roomId]
  );

  const bulkDeleteMessagesWithToast = useCallback(
    async (messageIds: string[]) => {
      try {
        await Promise.all(messageIds.map((id) => chatApi.deleteMessage(roomId, id)));
        toast.success(`${messageIds.length} پیام حذف شد`);
      } catch {
        toast.error('خطا در حذف پیام‌ها');
      }
    },
    [roomId]
  );

  const forwardMessagesWithToast = useCallback(
    async (targetRoomId: string, messagesToForward: ChatMessage[]) => {
      try {
        for (const msg of messagesToForward) {
          await forwardMessage(targetRoomId, msg);
        }
        toast.success(`${messagesToForward.length} پیام ارسال شد`);
      } catch {
        toast.error('خطا در ارسال پیام‌ها');
      }
    },
    [forwardMessage]
  );

  const copyMessageWithToast = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('پیام کپی شد');
    } catch {
      toast.error('خطا در کپی پیام');
    }
  }, []);

  return {
    messages,
    isLoading: api.isLoading,
    isError: api.isError,
    sendMessage,
    retryMessage,
    isSending: false,
    typingUsers: othersTyping,
    startTyping: () =>
      pusher.triggerClientEvent('typing:user_started', {
        userId: user?.id,
        userName: user?.name,
      }),
    stopTyping: () => pusher.triggerClientEvent('typing:user_stopped', { userId: user?.id }),
    currentUser: user,
    refetch: api.refetch,
    onlineCount: pusher.onlineCount,
    deleteMessage: api.deleteMessage,
    deleteMessageAsync: api.deleteMessageAsync,
    deleteMessageWithToast,
    updateMessage: updateMessageWithToast,
    bulkDeleteMessagesWithToast,
    forwardMessagesWithToast,
    copyMessageWithToast,
    hasOlderMessages: api.hasOlderMessages,
    isLoadingOlder: api.isLoadingOlder,
    loadOlderMessages: api.loadOlderMessages,
    getReadBy: readReceipts.getReadBy,
    isReadByUser: readReceipts.isReadByUser,
    registerMessageElement: readReceipts.registerMessageElement,
  };
}

export function useChatRooms(projectId?: string, activeRoomId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.chat.rooms(projectId || 'all');

  const query = useQuery({
    queryKey,
    queryFn: () => chatApi.getRooms(projectId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const pusher = (window as any).__pusherInstance;
    if (!pusher || !session?.user?.id) return;

    const personalChannel = pusher.subscribe(`private-user-${session.user.id}`);

    const onRoomUpdated = (data: RoomUpdatedPayload) => {
      queryClient.setQueryData<ChatRoom[]>(queryKey, (prev) => {
        if (!prev) return prev;
        const isActive = data.roomId === activeRoomId;
        return prev
          .map((room) =>
            room.id === data.roomId
              ? {
                  ...room,
                  lastMessage: data.lastMessage,
                  updatedAt: data.lastMessage.createdAt,
                  unreadCount:
                    data.isSender || isActive
                      ? (room.unreadCount ?? 0)
                      : (room.unreadCount ?? 0) + 1,
                }
              : room
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    personalChannel.bind('room:updated', onRoomUpdated);

    return () => {
      personalChannel.unbind('room:updated', onRoomUpdated);
      pusher.unsubscribe(`private-user-${session.user.id}`);
    };
  }, [session?.user?.id, queryClient, queryKey, activeRoomId]);

  useEffect(() => {
    if (!activeRoomId) return;

    queryClient.setQueryData<ChatRoom[]>(queryKey, (prev) => {
      if (!prev) return prev;
      return prev.map((room) => (room.id === activeRoomId ? { ...room, unreadCount: 0 } : room));
    });
  }, [activeRoomId, queryClient, queryKey]);

  return query;
}

export function useCreateChatRoom() {
  return useMutationWithToast({
    mutationFn: ({ projectId, name }: { projectId: string; name: string }) =>
      chatApi.createRoom(projectId, name),
    queryKey: queryKeys.chat.all,
    successMessage: 'چت روم با موفقیت ایجاد شد',
    errorMessage: 'خطا در ایجاد چت روم',
  });
}

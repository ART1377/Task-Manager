'use client';

import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Forward } from 'lucide-react';
import type { ChatMessage, ReplyInfo } from '../types';
import { MessageFooter } from './message-footer';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isHighlighted: boolean;
  onReply: (message: ReplyInfo) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReplyClick?: (messageId: string) => void;
  onSetRef: (id: string, el: HTMLDivElement | null) => void;
  onRetry?: (clientId: string) => void;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onCopy?: (content: string) => void;
  readBy?: string[];
  registerMessageElement?: (messageId: string, el: HTMLElement | null) => void;
}

export function MessageBubble({
  message,
  isOwn,
  isHighlighted,
  onReply,
  onEdit,
  onDelete,
  onReplyClick,
  onSetRef,
  onRetry,
  selectMode,
  isSelected,
  onToggleSelect,
  onLongPress,
  onCopy,
  readBy,
  registerMessageElement,
}: MessageBubbleProps) {
  const isPending = message.status === 'sending' || message.status === 'failed';
  const isSent = !isPending && !message.status;

  const timeString = new Date(message.createdAt).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn('w-full', isHighlighted && 'bg-primary/20 rounded-2xl')}>
      <motion.div
        role="article"
        aria-label={`پیام از ${message.sender.name}`}
        ref={(el) => {
          onSetRef(message.id, el);
          // Only other people's messages need read-tracking — you don't
          // mark your own message as "read by yourself".
          if (!isOwn) registerMessageElement?.(message.id, el);
        }}
        layout
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: message.status === 'sending' ? 0.6 : 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        onClick={() => {
          if (selectMode) onToggleSelect?.(message.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!selectMode) onLongPress?.(message.id);
        }}
        className={cn(
          'group/bubble relative w-fit max-w-[75%] min-w-30 rounded-2xl px-3.5 py-2 transition-colors duration-700',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted mr-auto rounded-bl-md',
          isHighlighted && 'bg-primary/80',
          selectMode && 'cursor-pointer',
          isSelected && 'ring-primary ring-2'
        )}
      >
        {selectMode && (
          <div
            className={cn(
              'absolute top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 bg-background',
              isOwn ? '-left-7' : '-right-7'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(message.id);
            }}
          >
            {isSelected && (
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}

        {message.forwardedFromName && (
          <p
            className={cn(
              'mb-1 flex items-center gap-1 text-[11px]',
              isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}
          >
            <Forward className="h-3 w-3" />
            از {message.forwardedFromName}
          </p>
        )}

        {message.replyTo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReplyClick?.(message.replyTo!.id);
            }}
            className={cn(
              'mb-1 block w-full cursor-pointer rounded-lg border-r-2 px-2 py-1 text-start text-xs transition-all hover:opacity-80 active:scale-[0.98]',
              isOwn
                ? 'bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground/70'
                : 'bg-background/50 border-primary/30 text-muted-foreground'
            )}
          >
            <p className="text-[11px] font-medium">{message.replyTo.sender.name}</p>
            <p className="truncate text-[11px]">{message.replyTo.content}</p>
          </button>
        )}

        {message.editedAt && (
          <span
            className={cn(
              'ml-1 inline-block text-[10px] opacity-50',
              isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground'
            )}
          >
            (ویرایش شده)
          </span>
        )}

        <p className="text-[13px] leading-relaxed wrap-break-word whitespace-pre-wrap">
          {message.content}
        </p>

        <div className="mt-1 flex items-center justify-end gap-1">
          <span
            className={cn(
              'shrink-0 text-[10px] select-none',
              isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
            )}
          >
            {timeString}
          </span>

          {isOwn && (
            <span className="ml-0.5 shrink-0">
              {message.status === 'sending' && (
                <span className="border-primary-foreground/40 inline-block h-3 w-3 animate-pulse rounded-full border" />
              )}

              {message.status === 'failed' && <span className="text-[10px] text-red-400">⚠</span>}

              {isSent && (!readBy || readBy.length === 0) && (
                <Check className="text-primary-foreground/50 h-3.5 w-3.5" strokeWidth={2.5} />
              )}

              {isSent && readBy && readBy.length > 0 && (
                <CheckCheck className="h-3.5 w-3.5 text-white/70" strokeWidth={2.5} />
              )}
            </span>
          )}
        </div>

        <MessageFooter
          message={message}
          isOwn={isOwn}
          isPending={isPending}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onRetry={onRetry}
          onCopy={onCopy}
        />
      </motion.div>
    </div>
  );
}

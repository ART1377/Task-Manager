'use client';

import { OnlineBadge } from '@/shared/components/online-badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn, formatDateTime, getInitials } from '@/shared/lib/utils';
import { usePresence } from '@/shared/providers/presence-provider';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../constants';
import { useTaskComments } from '../hooks/use-task-comments';
import type { Task } from '../types';

interface TaskDetailSheetProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

export function TaskDetailSheet({ task, open, onOpenChange, currentUserId }: TaskDetailSheetProps) {
  const [newComment, setNewComment] = useState('');
  const { comments, isLoading, addComment, isAddingComment } = useTaskComments(task.id, open);
  const { isUserOnline } = usePresence();

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto‑scroll to bottom whenever comments change or the sheet opens
  useEffect(() => {
    if (open && comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, open]);

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed || isAddingComment) return;
    addComment(trimmed);
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-120">
        {/* Header */}
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-base font-semibold">{task.title}</SheetTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={task.priority}
              label={TASK_PRIORITY_LABELS[task.priority]}
              variant="dot"
              size="xs"
            />
            <Badge variant="secondary" className="text-[10px]">
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
            {task.dueDate && (
              <span className="text-muted-foreground text-[10px]">
                موعد: {new Date(task.dueDate).toLocaleDateString('fa-IR')}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-muted-foreground mt-2 text-sm">{task.description}</p>
          )}
          {task.assignees && task.assignees.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs">واگذار شده به:</span>
              {task.assignees.map((assignee) => (
                <div key={assignee.userId} className="flex items-center gap-1.5">
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[9px]">
                        {getInitials(assignee.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <OnlineBadge isOnline={isUserOnline(assignee.userId)} />
                  </div>
                  <span className="text-xs">{assignee.user.name}</span>
                </div>
              ))}
            </div>
          )}
        </SheetHeader>

        {/* Comments section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h4 className="mb-3 text-sm font-medium">نظرات</h4>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">هنوز نظری ثبت نشده</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isOwn = comment.user.id === currentUserId;

                return (
                  <div
                    key={comment.id}
                    className={cn('flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <div className="relative h-fit shrink-0">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {getInitials(comment.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineBadge isOnline={isUserOnline(comment.user.id)} />
                    </div>
                    <div className={cn('min-w-0 flex-1', isOwn && 'flex flex-col items-end')}>
                      <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                        <p className="text-sm font-medium">{comment.user.name}</p>
                        <span className="text-muted-foreground text-[10px]">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'mt-1 inline-block max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tr-md'
                            : 'bg-muted rounded-tl-md'
                        )}
                      >
                        <p className="wrap-break-word whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Add comment input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="نظر خود را بنویسید..."
              rows={2}
              className="placeholder:text-muted-foreground/60 resize-none text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isAddingComment}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
            >
              {isAddingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

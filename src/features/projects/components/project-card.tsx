'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { ActionDropdown } from '@/shared/components/action-dropdown';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { canDeleteProject, canManageProject, ROLE_LABELS } from '@/shared/lib/permissions';
import { cn, formatDate, getInitials } from '@/shared/lib/utils';
import { CheckSquare, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../types';
import { ProjectMembersSheet } from './project-members-sheet';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDeleteRequest: (projectId: string) => void;
  onInvite: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDeleteRequest, onInvite }: ProjectCardProps) {
  const { user } = useAuth();
  const userCanManage = canManageProject(user, project);
  const userCanDelete = canDeleteProject(user, project);
  const [membersSheetOpen, setMembersSheetOpen] = useState(false);

  const actions = [];

  if (userCanManage) {
    actions.push({ label: 'ویرایش', icon: Pencil, onClick: () => onEdit(project) });
  }

  if (userCanManage) {
    actions.push({ label: 'دعوت عضو', icon: UserPlus, onClick: () => onInvite(project.id) });
  }

  if (userCanDelete) {
    actions.push({
      label: 'حذف',
      icon: Trash2,
      onClick: () => onDeleteRequest(project.id),
      destructive: true,
    });
  }

  const isOwner = project.ownerId === user?.id;
  const userRole = project.members?.find((m) => m.userId === user?.id)?.role;

  return (
    <>
      <Card className="card-hover group border-border/50 bg-card dark:border-border/30 dark:bg-card/80 dark:hover:border-border/50 relative flex h-full flex-col border shadow-sm transition-all duration-300">
        <div className="from-primary/5 pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
              <span className="text-primary text-base font-bold sm:text-lg">
                {getInitials(project.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 leading-tight font-semibold">{project.name}</p>{' '}
              <p className="text-muted-foreground text-xs">{formatDate(project.createdAt)}</p>
            </div>
          </div>
          {actions.length > 0 && <ActionDropdown items={actions} />}
          {actions.length === 0 && (
            <Badge variant="outline" className="text-[10px]">
              فقط مشاهده
            </Badge>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col">
          <p className="text-muted-foreground/80 mb-4 line-clamp-2 min-h-10 text-sm">
            {project.description || 'بدون توضیحات'}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMembersSheetOpen(true);
                      }}
                      className="cursor-pointer! rounded-full transition-all hover:scale-105 active:scale-95"
                    >
                      <Badge
                        variant="secondary"
                        className="group-hover/badge:bg-primary/10 group-hover/badge:text-primary gap-1 transition-colors"
                      >
                        <Users className="h-3 w-3" /> {project._count?.members ?? 0} عضو
                      </Badge>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px]">
                    مشاهده اعضای پروژه
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="secondary" className="gap-1">
                <CheckSquare className="h-3 w-3" /> {project._count?.tasks ?? 0} تسک
              </Badge>

              {userRole && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px]',
                    userRole === 'ADMIN' && 'border-primary/50 text-primary',
                    userRole === 'MANAGER' && 'border-blue-500/50 text-blue-500'
                  )}
                >
                  {userRole === 'ADMIN'
                    ? ROLE_LABELS.ADMIN
                    : userRole === 'MANAGER'
                      ? ROLE_LABELS.MANAGER
                      : ROLE_LABELS.MEMBER}
                </Badge>
              )}
            </div>
            {project.owner && (
              <div className="relative shrink-0">
                <Avatar className="ring-border h-7 w-7 ring-2">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(project.owner.name)}
                  </AvatarFallback>
                </Avatar>
                {isOwner && (
                  <span
                    className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400"
                    title="مالک پروژه"
                  >
                    <span className="text-[7px]">★</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ProjectMembersSheet
        project={project}
        currentUserId={user?.id || ''}
        open={membersSheetOpen}
        onOpenChange={setMembersSheetOpen}
      />
    </>
  );
}

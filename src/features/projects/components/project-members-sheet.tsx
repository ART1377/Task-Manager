'use client';

import { DeleteConfirmDialog } from '@/shared/components/delete-confirm-dialog';
import { OnlineBadge } from '@/shared/components/online-badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { ROLE_LABELS, canManageProject, canRemoveMember } from '@/shared/lib/permissions';
import { cn, getInitials } from '@/shared/lib/utils';
import { usePresence } from '@/shared/providers/presence-provider';
import {
  Calendar,
  Crown,
  Loader2,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useRemoveMember, useUpdateMemberRole } from '../hooks/use-project-members';
import type { Project } from '../types';
import { InviteMemberDialog } from './invite-member-dialog';

const ROLE_CONFIG = {
  ADMIN: {
    label: ROLE_LABELS.ADMIN,
    icon: ShieldCheck,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    description: 'دسترسی کامل به تنظیمات پروژه، مدیریت اعضا و همه تسک‌ها',
  },
  MANAGER: {
    label: ROLE_LABELS.MANAGER,
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'ایجاد، ویرایش و حذف همه تسک‌ها',
  },
  MEMBER: {
    label: ROLE_LABELS.MEMBER,
    icon: User,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    description: 'مشاهده تسک‌ها، کامنت و تغییر وضعیت تسک‌های واگذار شده',
  },
} as const;

const PERMISSION_MATRIX = [
  { label: 'حذف پروژه', owner: true, admin: false, manager: false, member: false },
  { label: 'ویرایش تنظیمات', owner: true, admin: true, manager: false, member: false },
  { label: 'مدیریت اعضا و نقش‌ها', owner: true, admin: true, manager: false, member: false },
  { label: 'ایجاد تسک', owner: true, admin: true, manager: true, member: false },
  { label: 'ویرایش همه تسک‌ها', owner: true, admin: true, manager: true, member: false },
  { label: 'حذف همه تسک‌ها', owner: true, admin: true, manager: true, member: false },
  { label: 'تغییر وضعیت تسک خود', owner: true, admin: true, manager: true, member: true },
  { label: 'کامنت گذاشتن', owner: true, admin: true, manager: true, member: true },
];

interface Props {
  project: Project;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectMembersSheet({ project, currentUserId, open, onOpenChange }: Props) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const { isUserOnline } = usePresence();
  const updateRoleMutation = useUpdateMemberRole(project.id);
  const removeMemberMutation = useRemoveMember(project.id);

  const owner = project.owner ?? { id: '', name: 'ناشناخته', avatar: null };
  const members = project.members ?? [];
  const isOwner = project.ownerId === currentUserId;
  const canManageRoles = canManageProject({ id: currentUserId }, project);

  const membersOnly = members.filter((m) => m.userId !== project.ownerId);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-110">
          {/* Header */}
          <SheetHeader className="border-b px-6 py-4">
            <div>
              <SheetTitle className="text-base">{project.name}</SheetTitle>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5" />
                {members.length} عضو
                {isOwner && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 text-[10px] text-amber-500"
                  >
                    <Crown className="mr-1 h-3 w-3" />
                    شما مالک هستید
                  </Badge>
                )}
              </p>
            </div>
          </SheetHeader>

          {/* Owner */}
          <div className="border-b px-6 py-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">مالک پروژه</span>
              <Badge
                variant="outline"
                className="ml-auto border-amber-500/50 text-[10px] text-amber-500"
              >
                دسترسی کامل
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-amber-500/30">
                  <AvatarFallback className="bg-amber-500/20 text-sm font-bold text-amber-600">
                    {getInitials(owner.name)}
                  </AvatarFallback>
                </Avatar>
                <OnlineBadge isOnline={isUserOnline(owner.id)} />
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">{owner.name}</p>
                <p className="text-muted-foreground text-[11px]">دسترسی کامل به همه بخش‌ها</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-3">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold">اعضای پروژه</span>
                  <span className="text-muted-foreground mr-1.5 text-[11px]">
                    {membersOnly.length} نفر
                  </span>
                </div>
                {canManageRoles && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInviteOpen(true)}
                    className="h-7 gap-1.5 rounded-lg text-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    دعوت عضو
                  </Button>
                )}
              </div>

              {membersOnly.length === 0 ? (
                <div className="border-border/50 flex flex-col items-center gap-2 rounded-xl border border-dashed py-10">
                  <Users className="text-muted-foreground/30 h-8 w-8" />
                  <p className="text-muted-foreground text-xs">هنوز عضوی اضافه نشده</p>
                  {canManageRoles && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInviteOpen(true)}
                      className="text-xs"
                    >
                      دعوت اولین عضو
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {membersOnly.map((member) => {
                    const config =
                      ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.MEMBER;
                    const Icon = config.icon;
                    const isCurrentUser = member.userId === currentUserId;
                    const canRemove = canRemoveMember({ id: currentUserId }, project, {
                      userId: member.userId,
                      role: member.role,
                    });

                    return (
                      <div
                        key={member.id}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl border p-2.5 transition-all hover:shadow-sm',
                          config.borderColor,
                          'hover:border-primary/20 bg-card'
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <Avatar className="ring-border/50 h-9 w-9 ring-2">
                            <AvatarFallback
                              className={cn(
                                'text-[11px] font-medium',
                                config.bgColor,
                                config.color
                              )}
                            >
                              {getInitials(member.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <OnlineBadge isOnline={isUserOnline(member.user.id)} />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-medium">{member.user.name}</p>
                            {isCurrentUser && (
                              <Badge variant="outline" className="h-4 py-0 text-[9px]">
                                شما
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                            {member.user.email}
                          </p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-muted-foreground/70 flex items-center gap-1 text-[10px]">
                              <Calendar className="h-3 w-3" />
                              {new Date(member.joinedAt).toLocaleDateString('fa-IR', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-destructive text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0 rounded-lg transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveTarget({ id: member.id, name: member.user.name });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {/* Role */}
                        <div className="shrink-0">
                          {canManageRoles && !isCurrentUser ? (
                            <Select
                              value={member.role}
                              onValueChange={(role) =>
                                updateRoleMutation.mutate({ memberId: member.id, role })
                              }
                              disabled={updateRoleMutation.isPending}
                            >
                              <SelectTrigger
                                className={cn(
                                  'h-8 w-32 min-w-fit gap-1.5 border px-2.5 text-[11px] font-medium',
                                  config.bgColor,
                                  config.color,
                                  config.borderColor,
                                  updateRoleMutation.isPending && 'cursor-not-allowed opacity-50'
                                )}
                              >
                                {updateRoleMutation.isPending ? (
                                  <span className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    در حال تغییر...
                                  </span>
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">
                                  <span className="flex items-center gap-2 text-xs">
                                    <ShieldCheck className="text-primary h-4 w-4" />
                                    {ROLE_LABELS.ADMIN}
                                  </span>
                                </SelectItem>
                                <SelectItem value="MANAGER">
                                  <span className="flex items-center gap-2 text-xs">
                                    <Shield className="h-4 w-4 text-blue-500" />
                                    {ROLE_LABELS.MANAGER}
                                  </span>
                                </SelectItem>
                                <SelectItem value="MEMBER">
                                  <span className="flex items-center gap-2 text-xs">
                                    <User className="text-muted-foreground h-4 w-4" />
                                    {ROLE_LABELS.MEMBER}
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      'flex cursor-default items-center gap-1.5 rounded-lg border px-2.5 py-1.5',
                                      config.borderColor,
                                      config.bgColor
                                    )}
                                  >
                                    <Icon className={cn('h-3.5 w-3.5', config.color)} />
                                    <span className={cn('text-[11px] font-medium', config.color)}>
                                      {config.label}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-48 text-[11px]">
                                  {config.description}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Role Guide */}
            <div className="border-t px-6 py-4">
              <h4 className="mb-3 text-xs font-semibold">راهنمای نقش‌ها</h4>

              <div className="mb-4 grid gap-2">
                {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border p-3',
                        config.borderColor,
                        config.bgColor
                      )}
                    >
                      <div className={cn('mt-0.5 rounded-lg p-1.5', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div>
                        <p className={cn('text-sm font-medium', config.color)}>{config.label}</p>
                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-3 py-2 text-right font-medium">دسترسی</th>
                      <th className="px-2 py-2 text-center font-medium">
                        <Crown className="inline-block h-3 w-3 text-amber-500" />
                      </th>
                      <th className="px-2 py-2 text-center font-medium">
                        <ShieldCheck className="text-primary inline-block h-3 w-3" />
                      </th>
                      <th className="px-2 py-2 text-center font-medium">
                        <Shield className="inline-block h-3 w-3 text-blue-500" />
                      </th>
                      <th className="px-2 py-2 text-center font-medium">
                        <User className="text-muted-foreground inline-block h-3 w-3" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {PERMISSION_MATRIX.map((row) => (
                      <tr key={row.label} className="hover:bg-muted/30">
                        <td className="px-3 py-2">{row.label}</td>
                        <td className="px-2 py-2 text-center">
                          {row.owner ? (
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-500">
                              ✓
                            </span>
                          ) : (
                            <span className="text-muted-foreground/20">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {row.admin ? (
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-500">
                              ✓
                            </span>
                          ) : (
                            <span className="text-muted-foreground/20">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {row.manager ? (
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-500">
                              ✓
                            </span>
                          ) : (
                            <span className="text-muted-foreground/20">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {row.member ? (
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-500">
                              ✓
                            </span>
                          ) : (
                            <span className="text-muted-foreground/20">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <InviteMemberDialog
        projectId={project.id}
        projectName={project.name}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      {/* Remove Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open && !removeMemberMutation.isPending) {
            setRemoveTarget(null);
          }
        }}
        title="حذف عضو"
        description={`آیا از حذف "${removeTarget?.name}" از پروژه مطمئن هستید؟ این عمل قابل بازگشت نیست و کاربر از تمام چت‌های پروژه نیز حذف خواهد شد.`}
        onConfirm={() => {
          if (removeTarget) {
            removeMemberMutation.mutate(removeTarget.id, {
              onSuccess: () => setRemoveTarget(null),
              onError: () => setRemoveTarget(null),
            });
          }
        }}
        isDeleting={removeMemberMutation.isPending}
      />
    </>
  );
}

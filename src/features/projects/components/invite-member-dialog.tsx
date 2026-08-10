'use client';

import { useProjectMembers } from '@/features/tasks/hooks/use-project-members';
import { DialogHeaderWithIcon } from '@/shared/components/dialog-header-with-icon';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { SubmitButton } from '@/shared/components/ui/submit-button';
import { cn, getInitials } from '@/shared/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProjects } from '../hooks/use-projects';
import { useUsers } from '../hooks/use-users';
import { inviteMemberSchema, type InviteMemberFormData } from '../validations';

interface InviteMemberDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { inviteMember, isInviting } = useProjects();
  const [email, setEmail] = useState('');

  // Fetch all users via hook (clean architecture)
  const { data: allUsers = [] } = useUsers();

  // Fetch current project members via existing hook
  const { data: members = [], isLoading: isLoadingMembers } = useProjectMembers(
    open ? projectId : undefined
  );

  // Derive member IDs
  const memberIds = useMemo(() => new Set(members.map((m) => m.user.id)), [members]);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: InviteMemberFormData) {
    inviteMember(
      { projectId, email: data.email },
      {
        onSuccess: () => {
          form.reset();
          setEmail('');
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeaderWithIcon
          icon={UserPlus}
          title="دعوت عضو جدید"
          description={`پروژه: ${projectName}`}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ایمیل</FormLabel>
                  <FormControl>
                    <Command className="rounded-lg border">
                      <CommandInput
                        placeholder="جستجوی کاربر..."
                        value={email}
                        onValueChange={(val) => {
                          setEmail(val);
                          field.onChange(val);
                        }}
                        disabled={isLoadingMembers}
                      />
                      <CommandList>
                        {isLoadingMembers ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>کاربری یافت نشد</CommandEmpty>
                            <CommandGroup heading="کاربران موجود">
                              {allUsers
                                .filter(
                                  (u) =>
                                    u.email.toLowerCase().includes(email.toLowerCase()) ||
                                    u.name.toLowerCase().includes(email.toLowerCase())
                                )
                                .slice(0, 10)
                                .map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={user.email}
                                    onSelect={() => {
                                      if (memberIds.has(user.id)) return;
                                      field.onChange(user.email);
                                      setEmail(user.email);
                                    }}
                                    disabled={memberIds.has(user.id)}
                                    className={cn(
                                      memberIds.has(user.id) && 'cursor-not-allowed opacity-50'
                                    )}
                                  >
                                    <div className="flex w-full items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[9px]">
                                          {getInitials(user.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{user.name}</p>
                                        <p className="text-muted-foreground truncate text-[11px]">
                                          {user.email}
                                        </p>
                                      </div>
                                      {memberIds.has(user.id) ? (
                                        <Badge
                                          variant="secondary"
                                          className="shrink-0 gap-1 text-[9px]"
                                        >
                                          <Check className="h-3 w-3" />
                                          عضو
                                        </Badge>
                                      ) : (
                                        <Check
                                          className={cn(
                                            'h-4 w-4 shrink-0',
                                            field.value === user.email ? 'opacity-100' : 'opacity-0'
                                          )}
                                        />
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton
              isLoading={isInviting}
              icon={UserPlus}
              label="دعوت به پروژه"
              className="w-full"
              disabled={isLoadingMembers}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

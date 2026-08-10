'use client';

import { DialogHeaderWithIcon } from '@/shared/components/dialog-header-with-icon';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { SubmitButton } from '@/shared/components/ui/submit-button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProjects } from '../hooks/use-projects';
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
                    <InputWithIcon
                      icon={Mail}
                      type="email"
                      placeholder="user@example.com"
                      disabled={isInviting}
                      {...field}
                    />
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
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

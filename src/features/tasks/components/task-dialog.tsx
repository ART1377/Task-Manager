'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { DialogHeaderWithIcon } from '@/shared/components/dialog-header-with-icon';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { PersianDatePicker } from '@/shared/components/ui/persian-date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { SubmitButton } from '@/shared/components/ui/submit-button';
import { Textarea } from '@/shared/components/ui/textarea';
import { canCreateTask } from '@/shared/lib/permissions';
import { cn } from '@/shared/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckSquare, ChevronsUpDown, Pencil, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProjectMembers } from '../hooks/use-project-members';
import { useTasks } from '../hooks/use-tasks';
import type { Task } from '../types';
import { createTaskSchema, type CreateTaskFormData } from '../validations';

interface TaskDialogProps {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TaskDialog({ task, open, onOpenChange, trigger }: TaskDialogProps) {
  const { createTask, isCreating, updateTask, isUpdating } = useTasks();
  const { projects } = useProjects();
  const { user } = useAuth();

  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);

  const isEditing = !!task;
  const isLoading = isEditing ? isUpdating : isCreating;

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'MEDIUM',
      projectId: task?.projectId ?? '',
      assigneeIds: task?.assignees?.map((a) => a.userId) ?? [],
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  const selectedProjectId = form.watch('projectId');
  const selectedAssigneeIds = form.watch('assigneeIds') || [];
  const { data: members = [] } = useProjectMembers(selectedProjectId || undefined);

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        projectId: task.projectId,
        assigneeIds: task.assignees?.map((a) => a.userId) ?? [],
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task, form]);

  function onSubmit(data: CreateTaskFormData) {
    const payload = {
      ...data,
      assigneeIds: data.assigneeIds?.length ? data.assigneeIds : undefined,
    };

    if (isEditing) {
      updateTask({ id: task!.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createTask(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  }

  const toggleAssignee = (userId: string) => {
    const current = form.getValues('assigneeIds') || [];
    if (current.includes(userId)) {
      form.setValue(
        'assigneeIds',
        current.filter((id) => id !== userId)
      );
    } else {
      form.setValue('assigneeIds', [...current, userId]);
    }
  };

  const removeAssignee = (userId: string) => {
    const current = form.getValues('assigneeIds') || [];
    form.setValue(
      'assigneeIds',
      current.filter((id) => id !== userId)
    );
  };

  const selectedMembers = members.filter((m) => selectedAssigneeIds.includes(m.user.id));

  // Filter projects where user can create tasks
  const availableProjects = projects.filter((p) => {
    if (!user) return false;
    return canCreateTask(user, p);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-140">
        <DialogHeaderWithIcon
          icon={isEditing ? Pencil : CheckSquare}
          title={isEditing ? 'ویرایش تسک' : 'ایجاد تسک جدید'}
          description={isEditing ? 'اطلاعات تسک را ویرایش کنید' : 'تسک جدید به برد اضافه کنید'}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            {/* Row 1: Project + Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>پروژه</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب پروژه" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProjects.length === 0 ? (
                          <div className="text-muted-foreground px-2 py-4 text-center text-sm">
                            شما اجازه ایجاد تسک در هیچ پروژه‌ای را ندارید
                          </div>
                        ) : (
                          availableProjects.map((p) => {
                            const memberRole = p.members?.find((m) => m.userId === user?.id)?.role;
                            const isOwner = p.ownerId === user?.id;
                            return (
                              <SelectItem key={p.id} value={p.id}>
                                <span className="flex items-center gap-2">
                                  <span>{p.name}</span>
                                  {isOwner && (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-500/50 text-[9px] text-amber-500"
                                    >
                                      مالک
                                    </Badge>
                                  )}
                                  {!isOwner && memberRole === 'ADMIN' && (
                                    <Badge
                                      variant="outline"
                                      className="border-primary/50 text-primary text-[9px]"
                                    >
                                      مدیر
                                    </Badge>
                                  )}
                                  {!isOwner && memberRole === 'MANAGER' && (
                                    <Badge
                                      variant="outline"
                                      className="border-blue-500/50 text-[9px] text-blue-500"
                                    >
                                      مدیر پروژه
                                    </Badge>
                                  )}
                                </span>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اولویت</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">کم</SelectItem>
                        <SelectItem value="MEDIUM">متوسط</SelectItem>
                        <SelectItem value="HIGH">زیاد</SelectItem>
                        <SelectItem value="URGENT">فوری</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان تسک</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: طراحی صفحه اصلی" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 3: Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="توضیح کوتاه..."
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 4: Assignees (Multi-select) + Due Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assigneeIds"
                render={() => (
                  <FormItem>
                    <FormLabel>واگذار به</FormLabel>
                    <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedProjectId || isLoading}
                          className="w-full justify-between"
                        >
                          {selectedAssigneeIds.length > 0
                            ? `${selectedAssigneeIds.length} نفر انتخاب شده`
                            : 'انتخاب اعضا'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="جستجوی عضو..." />
                          <CommandList>
                            <CommandEmpty>عضوی یافت نشد</CommandEmpty>
                            <CommandGroup>
                              {members.map((member) => (
                                <CommandItem
                                  key={member.user.id}
                                  value={member.user.name}
                                  onSelect={() => toggleAssignee(member.user.id)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedAssigneeIds.includes(member.user.id)
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {member.user.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {/* Selected assignees chips */}
                    {selectedMembers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedMembers.map((member) => (
                          <Badge key={member.user.id} variant="secondary" className="gap-1 pr-1.5">
                            {member.user.name}
                            <button
                              type="button"
                              onClick={() => removeAssignee(member.user.id)}
                              className="hover:bg-muted ml-0.5 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>موعد تحویل</FormLabel>
                    <FormControl>
                      <PersianDatePicker
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                انصراف
              </Button>
              <SubmitButton
                isLoading={isLoading}
                icon={isEditing ? Pencil : Plus}
                label={isEditing ? 'ذخیره تغییرات' : 'ایجاد تسک'}
                disabled={!selectedProjectId}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { auth } from '@/features/auth/auth-config';
import { TASK_STATUS_LABELS } from '@/shared/lib/constants';
import { prisma } from '@/shared/lib/prisma';
import { sendPusherNotification } from '@/shared/lib/pusher-notifications';
import { sendSSENotification } from '@/shared/lib/sse';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, assigneeIds, dueDate } = body;

    // Get existing task with project members for permission check
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true } },
        assignees: { select: { userId: true } },
        project: {
          select: {
            ownerId: true,
            name: true,
            members: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'تسک یافت نشد' }, { status: 404 });
    }

    // ─── Permission Check ───
    const isSystemAdmin = session.user.role === 'ADMIN';
    const isProjectOwner = existingTask.project.ownerId === session.user.id;
    const isProjectAdminOrManager = existingTask.project.members.some(
      (m) => m.userId === session.user.id && (m.role === 'ADMIN' || m.role === 'MANAGER')
    );
    const isCreator = existingTask.creatorId === session.user.id;
    const isAssignee = existingTask.assignees.some((a) => a.userId === session.user.id);

    // Assignees can only change status, not other fields
    const onlyChangingStatus =
      Object.keys(body).every((key) => ['status', 'assigneeIds'].includes(key)) &&
      status !== undefined;

    if (!isSystemAdmin && !isProjectOwner && !isProjectAdminOrManager && !isCreator) {
      // Assignees can only change status
      if (isAssignee && onlyChangingStatus) {
        // Allowed: assignee changing status
      } else {
        return NextResponse.json({ error: 'شما اجازه ویرایش این تسک را ندارید' }, { status: 403 });
      }
    }

    // ─── Build update data ───
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    // Handle assignees update (only admins/managers/owner can change assignees)
    if (assigneeIds !== undefined) {
      if (!isSystemAdmin && !isProjectOwner && !isProjectAdminOrManager && !isCreator) {
        return NextResponse.json(
          { error: 'شما اجازه تغییر واگذارشونده را ندارید' },
          { status: 403 }
        );
      }
      await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      if (assigneeIds.length > 0) {
        await prisma.taskAssignee.createMany({
          data: assigneeIds.map((userId: string) => ({ taskId: id, userId })),
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        creator: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    // ─── Notification: Status changed ───
    if (status && status !== existingTask.status) {
      const oldAssigneeIds = existingTask.assignees.map((a) => a.userId);
      const statusLabel = TASK_STATUS_LABELS[status] || status;

      for (const assigneeId of oldAssigneeIds) {
        if (assigneeId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: assigneeId,
              title: 'بروزرسانی تسک',
              message: `وضعیت تسک "${existingTask.title}" به "${statusLabel}" تغییر کرد`,
              type: 'TASK_UPDATED',
            },
          });

          sendSSENotification({
            userId: assigneeId,
            type: 'TASK_UPDATED',
            title: 'بروزرسانی تسک',
            message: `وضعیت تسک "${existingTask.title}" به "${statusLabel}" تغییر کرد`,
            data: { taskId: id, projectId: task.projectId },
          });

          // NEW: Pusher notification (works on Vercel)
          await sendPusherNotification(assigneeId, {
            type: 'TASK_UPDATED',
            title: 'بروزرسانی تسک',
            message: `وضعیت تسک "${existingTask.title}" به "${statusLabel}" تغییر کرد`,
            data: { taskId: id, projectId: task.projectId },
          });
        }
      }
    }

    // ─── Notification: New assignees ───
    if (assigneeIds !== undefined) {
      const oldAssigneeIds = new Set(existingTask.assignees.map((a) => a.userId));
      const newAssignees = assigneeIds.filter((uid: string) => !oldAssigneeIds.has(uid));

      for (const assigneeId of newAssignees) {
        if (assigneeId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: assigneeId,
              title: 'تسک جدید',
              message: `تسک "${task.title}" در پروژه "${task.project?.name || 'ناشناخته'}" به شما واگذار شد`,
              type: 'TASK_ASSIGNED',
            },
          });

          sendSSENotification({
            userId: assigneeId,
            type: 'TASK_ASSIGNED',
            title: 'تسک جدید',
            message: `تسک "${task.title}" در پروژه "${task.project?.name || 'ناشناخته'}" به شما واگذار شد`,
            data: { projectId: task.projectId, taskId: task.id },
          });

          // NEW: Pusher notification
          await sendPusherNotification(assigneeId, {
            type: 'TASK_ASSIGNED',
            title: 'تسک جدید',
            message: `تسک "${task.title}" در پروژه "${task.project?.name || 'ناشناخته'}" به شما واگذار شد`,
            data: { projectId: task.projectId, taskId: task.id },
          });
        }
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی تسک' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get task with project members for permission check
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            ownerId: true,
            members: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'تسک یافت نشد' }, { status: 404 });
    }

    // ─── Permission Check ───
    const isSystemAdmin = session.user.role === 'ADMIN';
    const isProjectOwner = task.project.ownerId === session.user.id;
    const isProjectAdminOrManager = task.project.members.some(
      (m) => m.userId === session.user.id && (m.role === 'ADMIN' || m.role === 'MANAGER')
    );
    const isCreator = task.creatorId === session.user.id;

    if (!isSystemAdmin && !isProjectOwner && !isProjectAdminOrManager && !isCreator) {
      return NextResponse.json({ error: 'شما اجازه حذف این تسک را ندارید' }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'خطا در حذف تسک' }, { status: 500 });
  }
}

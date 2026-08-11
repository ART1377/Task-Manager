import { auth } from '@/features/auth/auth-config';
import { prisma } from '@/shared/lib/prisma';
import { sendPusherNotification } from '@/shared/lib/pusher-notifications';
import { pusherServer } from '@/shared/lib/pusher-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: taskId } = await params;

    // Check user is member of the task's project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        projectId: true,
        project: {
          select: {
            ownerId: true,
            members: { where: { userId: session.user.id }, select: { id: true } },
          },
        },
      },
    });
    if (!task) return NextResponse.json({ error: 'تسک یافت نشد' }, { status: 404 });
    if (task.project.ownerId !== session.user.id && task.project.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'خطا در دریافت نظرات' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: taskId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'متن نظر نمی‌تواند خالی باشد' }, { status: 400 });
    }

    // Check membership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        projectId: true,
        project: {
          select: {
            ownerId: true,
            members: { where: { userId: session.user.id }, select: { id: true } },
          },
        },
      },
    });
    if (!task) return NextResponse.json({ error: 'تسک یافت نشد' }, { status: 404 });
    if (task.project.ownerId !== session.user.id && task.project.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comment = await prisma.taskComment.create({
      data: { taskId, userId: session.user.id, content: content.trim() },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // existing broadcast to the task channel (used by the comment sheet)
    await pusherServer.trigger(`project-${taskId}`, 'comment:new', {
      taskId,
      comment,
    });

    // NEW: also broadcast on the global channel so the comment count badge updates everywhere
    await pusherServer.trigger('global-comments', 'comment:new', {
      taskId,
      comment,
    });

    // Notify task assignees & creator (except commenter)
    const taskInfo = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, assignees: { select: { userId: true } }, creatorId: true },
    });
    if (taskInfo) {
      const notifyUsers = new Set(taskInfo.assignees.map((a) => a.userId));
      notifyUsers.add(taskInfo.creatorId);
      notifyUsers.delete(session.user.id);
      for (const uid of notifyUsers) {
        await sendPusherNotification(uid, {
          type: 'COMMENT_ADDED',
          title: 'نظر جدید',
          message: `نظر جدیدی روی تسک "${taskInfo.title}" ثبت شد`,
          data: { taskId, projectId: task?.projectId || '' },
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: 'خطا در ثبت نظر' }, { status: 500 });
  }
}

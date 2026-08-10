import { auth } from '@/features/auth/auth-config';
import { prisma } from '@/shared/lib/prisma';
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

    // Broadcast via Pusher to the global comments channel
    if (task) {
      await pusherServer.trigger(`project-${taskId}`, 'comment:new', {
        taskId,
        comment,
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: 'خطا در ثبت نظر' }, { status: 500 });
  }
}

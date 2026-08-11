import { auth } from '@/features/auth/auth-config';
import { prisma } from '@/shared/lib/prisma';
import { sendPusherNotification } from '@/shared/lib/pusher-notifications';
import { sendSSENotification } from '@/shared/lib/sse';
import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');
    const search = searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Base filter: only tasks from projects the user belongs to
    const where: Prisma.TaskWhereInput = {
      project: {
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
      },
    };

    if (projectId) {
      // Override with specific project (but still check membership later)
      where.projectId = projectId;
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assignees = { some: { userId: assigneeId } };
    if (search) {
      where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
    }

    // Ensure the user is a member of the requested project
    if (projectId) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: session.user.id },
      });
      const isOwner = await prisma.project.findFirst({
        where: { id: projectId, ownerId: session.user.id },
      });
      if (!isMember && !isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [];
    const direction: Prisma.SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    switch (sortBy) {
      case 'dueDate':
        orderBy.push({ dueDate: { sort: direction, nulls: 'last' } });
        break;
      case 'priority':
        orderBy.push({ priority: direction }, { createdAt: 'desc' });
        break;
      default:
        orderBy.push({ createdAt: direction });
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignees: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        creator: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'خطا در دریافت تسک‌ها' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, projectId, assigneeIds, dueDate } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: 'عنوان و پروژه الزامی هستند' }, { status: 400 });
    }

    // Check membership: user must be owner, ADMIN, or MANAGER of the project
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: session.user.id },
    });
    const isOwner = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
    });

    if (!isOwner && (!member || (member.role !== 'ADMIN' && member.role !== 'MANAGER'))) {
      return NextResponse.json(
        { error: 'شما اجازه ایجاد تسک در این پروژه را ندارید' },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        projectId,
        creatorId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignees: assigneeIds?.length
          ? { create: assigneeIds.map((userId: string) => ({ userId })) }
          : undefined,
      },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        creator: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    // Send notifications to all assignees (except creator)
    if (assigneeIds?.length) {
      for (const assigneeId of assigneeIds) {
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد تسک' }, { status: 500 });
  }
}

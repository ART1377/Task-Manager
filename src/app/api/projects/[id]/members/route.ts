import { auth } from '@/features/auth/auth-config';
import { prisma } from '@/shared/lib/prisma';
import { sendPusherNotification } from '@/shared/lib/pusher-notifications';
import { sendSSENotification } from '@/shared/lib/sse';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Verify membership
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        ownerId: true,
        members: { where: { userId: session.user.id }, select: { id: true } },
      },
    });
    if (!project) return NextResponse.json({ error: 'پروژه یافت نشد' }, { status: 404 });
    if (project.ownerId !== session.user.id && project.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: 'خطا در دریافت اعضا' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const { email } = await request.json();

    // Check invite permission: owner or ADMIN
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { where: { userId: session.user.id }, select: { role: true } },
      },
    });
    if (!project) return NextResponse.json({ error: 'پروژه یافت نشد' }, { status: 404 });

    const isOwner = project.ownerId === session.user.id;
    const isAdmin = project.members.some((m) => m.role === 'ADMIN');
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'شما اجازه دعوت عضو ندارید' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'کاربری با این ایمیل یافت نشد' }, { status: 404 });

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (existingMember)
      return NextResponse.json({ error: 'این کاربر قبلاً عضو پروژه است' }, { status: 400 });

    const member = await prisma.projectMember.create({
      data: { projectId, userId: user.id, role: 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    // Add to chat room if exists
    const chatRoom = await prisma.chatRoom.findFirst({ where: { projectId } });
    if (chatRoom) {
      await prisma.chatRoomMember.create({ data: { roomId: chatRoom.id, userId: user.id } });
    }

    const projectName = project.name || 'ناشناخته';
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'دعوت به پروژه',
        message: `شما به پروژه "${projectName}" دعوت شدید`,
        type: 'PROJECT_INVITE',
      },
    });

    sendSSENotification({
      userId: user.id,
      type: 'PROJECT_INVITE',
      title: 'دعوت به پروژه',
      message: `شما به پروژه "${projectName}" دعوت شدید`,
      data: { projectId },
    });

    // NEW: Pusher notification
    await sendPusherNotification(user.id, {
      type: 'PROJECT_INVITE',
      title: 'دعوت به پروژه',
      message: `شما به پروژه "${projectName}" دعوت شدید`,
      data: { projectId },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'خطا در اضافه کردن عضو' }, { status: 500 });
  }
}

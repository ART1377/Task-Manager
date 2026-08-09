import { auth } from '@/features/auth/auth-config';
import { prisma } from '@/shared/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, memberId } = await params;
    const { role } = await request.json();

    if (!role || !['ADMIN', 'MANAGER', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'نقش نامعتبر است' }, { status: 400 });
    }

    // Check if user has permission (project owner or admin)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: session.user.id },
          select: { role: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'پروژه یافت نشد' }, { status: 404 });
    }

    const isOwner = project.ownerId === session.user.id;
    const isAdmin = project.members.some((m) => m.role === 'ADMIN');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'شما اجازه تغییر نقش اعضا را ندارید' }, { status: 403 });
    }

    // Find the member to update
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      select: { userId: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'عضو یافت نشد' }, { status: 404 });
    }

    // Cannot change owner's role
    if (member.userId === project.ownerId) {
      return NextResponse.json({ error: 'نقش مالک پروژه قابل تغییر نیست' }, { status: 400 });
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update member role error:', error);
    return NextResponse.json({ error: 'خطا در تغییر نقش کاربر' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, memberId } = await params;

    // Get project with members for permission check
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'پروژه یافت نشد' }, { status: 404 });
    }

    // Get the target member
    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'عضو یافت نشد' }, { status: 404 });
    }

    // Permission: Only owner or admin can remove
    const isOwner = project.ownerId === session.user.id;
    const currentUserMember = project.members.find((m) => m.userId === session.user.id);
    const isAdmin = currentUserMember?.role === 'ADMIN';
    const isSystemAdmin = session.user.role === 'ADMIN';

    if (!isSystemAdmin && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'شما اجازه حذف اعضا را ندارید' }, { status: 403 });
    }

    // Owner can't be removed
    if (targetMember.userId === project.ownerId) {
      return NextResponse.json({ error: 'مالک پروژه را نمی‌توان حذف کرد' }, { status: 400 });
    }

    // Admin can't remove other admins
    if (isAdmin && !isOwner && targetMember.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'شما نمی‌توانید مدیران دیگر را حذف کنید' },
        { status: 403 }
      );
    }

    // Can't remove yourself
    if (targetMember.userId === session.user.id) {
      return NextResponse.json({ error: 'نمی‌توانید خودتان را حذف کنید' }, { status: 400 });
    }

    // Also remove from chat rooms
    const chatRooms = await prisma.chatRoom.findMany({
      where: { projectId },
      select: { id: true },
    });

    await prisma.$transaction([
      // Remove from project
      prisma.projectMember.delete({ where: { id: memberId } }),
      // Remove from all project chat rooms
      ...chatRooms.map((room) =>
        prisma.chatRoomMember.deleteMany({
          where: { roomId: room.id, userId: targetMember.userId },
        })
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json({ error: 'خطا در حذف عضو' }, { status: 500 });
  }
}

import type { Project, ProjectMember } from '@/features/projects/types';

export type SystemRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type ProjectRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

interface UserData {
  id: string;
  role?: string | null; // system‑level role (ADMIN = full system admin)
}

// ── helpers ──────────────────────────────────
function isSystemAdmin(user: UserData | null | undefined): boolean {
  return user?.role === 'ADMIN';
}

function getProjectRole(userId: string, members: ProjectMember[] | undefined): ProjectRole | null {
  if (!members) return null;
  const member = members.find((m) => m.userId === userId);
  return (member?.role as ProjectRole) || null;
}

function isAssignedToTask(userId: string, task: { assignees?: { userId: string }[] }): boolean {
  if (!task.assignees) return false;
  return task.assignees.some((a) => a.userId === userId);
}

// ── Project‑level permissions ────────────────
/** Only the owner (or a system admin) can delete the entire project. */
export function canDeleteProject(user: UserData | null | undefined, project: Project): boolean {
  if (!user) return false;
  return isSystemAdmin(user) || project.ownerId === user.id;
}

/** Owner or project ADMIN can edit settings and manage members. */
export function canManageProject(user: UserData | null | undefined, project: Project): boolean {
  if (!user) return false;
  if (isSystemAdmin(user) || project.ownerId === user.id) return true;
  const role = getProjectRole(user.id, project.members);
  return role === 'ADMIN';
}

// ── Task‑level permissions ───────────────────
/** Owner, ADMIN, or MANAGER can create tasks in the project. */
export function canCreateTask(user: UserData | null | undefined, project: Project): boolean {
  if (!user) return false;
  if (isSystemAdmin(user) || project.ownerId === user.id) return true;
  const role = getProjectRole(user.id, project.members);
  return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Full edit (title, description, priority, etc.).
 * Allowed: Owner, ADMIN, MANAGER, or the task creator.
 * Assignees can **not** fully edit; they only change status via drag.
 */
export function canEditTask(
  user: UserData | null | undefined,
  task: { creatorId: string; assignees?: { userId: string }[] },
  project: Project
): boolean {
  if (!user) return false;
  if (isSystemAdmin(user) || project.ownerId === user.id) return true;
  const role = getProjectRole(user.id, project.members);
  if (role === 'ADMIN' || role === 'MANAGER') return true;
  return task.creatorId === user.id;
}

/**
 * Delete a task.
 * Allowed: Owner, ADMIN, MANAGER (any task), or the task creator.
 */
export function canDeleteTask(
  user: UserData | null | undefined,
  task: { creatorId: string },
  project: Project
): boolean {
  if (!user) return false;
  if (isSystemAdmin(user) || project.ownerId === user.id) return true;
  const role = getProjectRole(user.id, project.members);
  if (role === 'ADMIN' || role === 'MANAGER') return true;
  return task.creatorId === user.id;
}

/**
 * Move a task (drag & drop status change).
 * Allowed: Owner, ADMIN, MANAGER, task creator, or any assignee.
 */
export function canMoveTask(
  user: UserData | null | undefined,
  project: Project,
  task?: { creatorId: string; assignees?: { userId: string }[] }
): boolean {
  if (!user) return false;
  if (isSystemAdmin(user) || project.ownerId === user.id) return true;
  const role = getProjectRole(user.id, project.members);
  if (role === 'ADMIN' || role === 'MANAGER') return true;
  if (task) {
    if (task.creatorId === user.id) return true;
    if (isAssignedToTask(user.id, task)) return true;
  }
  return false;
}

/** Any project member (including owner) can comment. */
export function canComment(user: UserData | null | undefined, project: Project): boolean {
  if (!user) return false;
  return (
    isSystemAdmin(user) ||
    project.ownerId === user.id ||
    getProjectRole(user.id, project.members) !== null
  );
}

// ── Chat message permission ──────────────────
export function canManageMessage(
  user: UserData | null | undefined,
  messageSenderId: string
): boolean {
  if (!user) return false;
  return isSystemAdmin(user) || messageSenderId === user.id;
}

/**
 * Check if user can remove a specific member from the project.
 * Owner can remove anyone. Admin can remove members/managers (not owner or other admins).
 */
export function canRemoveMember(
  user: UserData | null | undefined,
  project: Project,
  targetMember: { userId: string; role: string }
): boolean {
  if (!user) return false;
  if (isSystemAdmin(user)) return true;

  // Owner can remove anyone except themselves
  if (project.ownerId === user.id) {
    return targetMember.userId !== user.id;
  }

  // Admin can remove members and managers (not owner, not other admins)
  const userRole = getProjectRole(user.id, project.members);
  if (userRole === 'ADMIN') {
    if (targetMember.userId === project.ownerId) return false; // Can't remove owner
    if (targetMember.role === 'ADMIN') return false; // Can't remove other admins
    return targetMember.userId !== user.id; // Can't remove self
  }

  return false;
}

// ── Labels & variants (consistent across the app) ──
export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'مالک',
  ADMIN: 'مدیر پروژه',
  MANAGER: 'مدیر اجرایی',
  MEMBER: 'عضو',
};

export function getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'ADMIN':
      return 'default';
    case 'MANAGER':
      return 'secondary';
    default:
      return 'outline';
  }
}

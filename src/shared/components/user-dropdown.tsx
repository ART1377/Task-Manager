'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ROUTES } from '@/shared/lib/routes';
import { getInitials } from '@/shared/lib/utils';
import { ChevronRight, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

const roleLabels: Record<string, string> = {
  ADMIN: 'مدیر سیستم',
  MANAGER: 'مدیر پروژه',
  MEMBER: 'عضو',
};

export function UserDropdown({ user, align = 'end' }: UserDropdownProps) {
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="ring-border hover:ring-primary/30 h-7 w-7 ring-2 transition-all hover:shadow-md">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
              {getInitials(user.name || 'کاربر')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-1.5 sm:w-72 sm:p-2" align={align} sideOffset={8}>
        {/* User Card — compact on mobile */}
        <div className="flex items-center gap-2.5 p-2 sm:gap-3 sm:p-3">
          <Avatar className="ring-border/50 h-9 w-9 ring-2 sm:h-12 sm:w-12">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold sm:text-sm">
              {getInitials(user.name || 'کاربر')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold sm:text-sm">{user.name || 'کاربر'}</p>
            <p className="text-muted-foreground truncate text-[10px] sm:text-xs">{user.email}</p>
            {user.role && (
              <span className="text-primary bg-primary/10 mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:text-[10px]">
                {roleLabels[user.role] || user.role}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        {/* Menu Items — compact on mobile */}
        <div className="space-y-0.5">
          <DropdownMenuItem asChild>
            <Link
              href={ROUTES.SETTINGS}
              className="group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-muted group-hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8">
                  <User className="text-muted-foreground group-hover:text-primary h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                </div>
                <span className="font-medium">پروفایل</span>
              </div>
              <ChevronRight className="text-muted-foreground/30 group-hover:text-muted-foreground h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={ROUTES.SETTINGS}
              className="group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-muted group-hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8">
                  <Settings className="text-muted-foreground group-hover:text-primary h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                </div>
                <span className="font-medium">تنظیمات</span>
              </div>
              <ChevronRight className="text-muted-foreground/30 group-hover:text-muted-foreground h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="group text-destructive/80 hover:text-destructive flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm"
        >
          <div className="bg-destructive/5 group-hover:bg-destructive/10 mr-2 flex h-7 w-7 items-center justify-center rounded-lg transition-colors sm:mr-3 sm:h-8 sm:w-8">
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="font-medium">خروج از حساب</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

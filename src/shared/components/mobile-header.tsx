'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { ThemeQuickSwitch } from '@/features/settings/components/theme-quick-switch';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet';
import { ROUTES } from '@/shared/lib/routes';
import { cn, getInitials } from '@/shared/lib/utils';
import {
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { title: 'داشبورد', icon: LayoutDashboard, href: ROUTES.DASHBOARD },
  { title: 'پروژه‌ها', icon: FolderKanban, href: ROUTES.PROJECTS },
  { title: 'تسک‌ها', icon: CheckSquare, href: ROUTES.TASKS },
  { title: 'چت', icon: MessageSquare, href: ROUTES.CHAT },
  { title: 'اعلان‌ها', icon: Bell, href: ROUTES.NOTIFICATIONS },
  { title: 'تنظیمات', icon: Settings, href: ROUTES.SETTINGS },
];

export function MobileHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between border-b px-3 backdrop-blur-xl md:hidden">
      {/* Hamburger menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted h-10 w-10 rounded-xl transition-all active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0">
          {/* Header — matching sidebar style */}
          <div className="border-b px-5 py-4">
            <Link
              href={ROUTES.DASHBOARD}
              onClick={closeSheet}
              className="group flex items-center gap-3"
            >
              <div className="bg-primary/10 pulse-glow group-hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110">
                <Sparkles className="text-primary h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold">تسک منیجر</SheetTitle>
                <p className="text-muted-foreground text-xs">Pro</p>
              </div>
            </Link>
          </div>

          {/* User info — matching sidebar footer style */}
          {user && (
            <div className="border-b px-4 py-3">
              <div className="bg-muted/50 flex items-center gap-3 rounded-xl p-3">
                <Avatar className="ring-primary/20 h-9 w-9 ring-2">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(user.name || 'کاربر')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name || 'کاربر'}</p>
                  <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation — matching sidebar menu style */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <p className="text-muted-foreground/50 mb-2 px-3 text-[10px] font-semibold tracking-wider uppercase">
              منو اصلی
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSheet}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                        : 'text-muted-foreground group-hover:bg-muted group-hover:text-foreground bg-transparent'
                    )}
                  >
                    <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span className={cn(isActive && 'font-semibold')}>{item.title}</span>
                  {isActive && (
                    <span className="mr-auto flex h-1.5 w-1.5">
                      <span className="bg-primary/40 absolute inline-flex h-full w-full animate-ping rounded-full" />
                      <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout — matching sidebar logout style */}
          <div className="border-t p-3">
            <button
              onClick={() => {
                logout();
                closeSheet();
              }}
              className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex w-full cursor-pointer! items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
            >
              <div className="bg-destructive/5 group-hover:bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span>خروج از حساب</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
          <Sparkles className="text-primary h-4 w-4" />
        </div>
        <span className="text-sm font-bold">تسک منیجر</span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <ThemeQuickSwitch />
        <NotificationBell />
        <Avatar className="ring-border h-8 w-8 ring-2">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
            {getInitials(user?.name || 'کاربر')}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

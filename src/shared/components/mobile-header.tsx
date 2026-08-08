'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { ThemeQuickSwitch } from '@/features/settings/components/theme-quick-switch';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet';
import { ROUTES } from '@/shared/lib/routes';
import { cn } from '@/shared/lib/utils';
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
import { UserDropdown } from './user-dropdown';

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
    <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl md:hidden">
      {/* Hamburger menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="touch-target h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-72 flex-col p-0">
          {/* Sheet header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="text-primary h-4 w-4" />
              </div>
              <SheetTitle className="text-base font-bold">تسک منیجر</SheetTitle>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSheet}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98]',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t p-3">
            <button
              onClick={() => {
                logout();
                closeSheet();
              }}
              className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
        <Sparkles className="text-primary h-5 w-5" />
        <span className="text-sm font-semibold">تسک منیجر</span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <ThemeQuickSwitch />
        <NotificationBell />
        <UserDropdown user={user ?? {}} />
      </div>
    </header>
  );
}

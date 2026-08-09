'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { BarChart3, Globe, Info, Kanban, MessageSquare, Shield, Users, Zap } from 'lucide-react';

interface ProjectInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  {
    icon: Kanban,
    title: 'Kanban Board',
    description: 'مدیریت تسک‌ها با drag & drop',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'ارتباط تیمی با Pusher',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    description: 'نقش‌های مالک، مدیر و عضو',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Member Management',
    description: 'دعوت و تغییر نقش اعضا',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description: 'نمودار و آمار پروژه‌ها',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Globe,
    title: 'Color Themes',
    description: '۶ تم رنگی با حالت تاریک',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
];

const techStack = [
  'Next.js 16',
  'TypeScript',
  'Prisma + PostgreSQL',
  'NextAuth.js',
  'Pusher (Real-time)',
  'Tailwind CSS',
  'shadcn/ui',
  'React Query',
  'Framer Motion',
  'React Hook Form + Zod',
];

export function ProjectInfoDialog({ open, onOpenChange }: ProjectInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="from-primary/10 to-primary/5 bg-linear-to-br px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="text-primary h-5 w-5" />
              Task Manager Pro
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            یه ابزار مدیریت پروژه و تسک فول‌استک، متن‌باز و آماده‌ی نمایش. با معماری تمیز، real-time
            chat، احراز هویت و سطح دسترسی حرفه‌ای.
          </p>
        </div>

        {/* Features Grid */}
        <div className="px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold">ویژگی‌های کلیدی</h4>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.bg} flex items-start gap-2.5 rounded-xl p-3`}
              >
                <feature.icon className={`${feature.color} mt-0.5 h-4 w-4 shrink-0`} />
                <div>
                  <p className="text-xs font-medium">{feature.title}</p>
                  <p className="text-muted-foreground text-[10px]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-muted/30 px-6 py-4">
          <h4 className="mb-2 text-xs font-semibold">تکنولوژی‌ها</h4>
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-[10px]">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <Info className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                راهنمای استفاده
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                این پروژه به‌عنوان{' '}
                <span className="text-foreground font-semibold">نمونه‌کار رزومه</span> ساخته شده. از
                دکمه{' '}
                <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  ورود دمو
                </span>{' '}
                در صفحه ورود استفاده کنید تا به‌عنوان{' '}
                <span className="text-foreground font-semibold">مدیر سیستم</span> با{' '}
                <span className="text-foreground font-semibold">داده‌های واقعی</span> وارد شوید و
                تمام امکانات را بررسی کنید.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

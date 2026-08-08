import { EmptyState } from '@/shared/components/empty-state';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { formatDate } from '@/shared/lib/utils';
import { Calendar, Clock } from 'lucide-react';
import type { DashboardStats } from '../types';

interface UpcomingDeadlinesProps {
  deadlines?: DashboardStats['upcomingDeadlines'];
}

const priorityLabels: Record<string, string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
  URGENT: 'فوری',
};

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  if (!deadlines || deadlines.length === 0) {
    return (
      <Card className="card-hover border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">موعدهای نزدیک</CardTitle>
          <CardDescription>موعدی برای ۷ روز آینده وجود ندارد</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="موعدی نزدیک نیست"
            description="همه تسک‌ها به‌روز هستند"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">موعدهای نزدیک</CardTitle>
        <CardDescription>تسک‌های با موعد تحویل در ۷ روز آینده</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="group border-border/50 bg-background hover:border-primary/20 flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 hover:shadow-sm"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Calendar className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{deadline.title}</p>
                <p className="text-muted-foreground text-xs">{deadline.projectName}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Clock className="text-muted-foreground h-3 w-3" />
                  <span className="text-muted-foreground text-xs">
                    {deadline.dueDate ? formatDate(deadline.dueDate) : 'بدون تاریخ'}
                  </span>
                  <StatusBadge
                    status={deadline.priority}
                    label={priorityLabels[deadline.priority] || deadline.priority}
                    size="xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

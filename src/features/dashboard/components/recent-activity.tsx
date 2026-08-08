import { EmptyState } from '@/shared/components/empty-state';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { TASK_STATUS_LABELS } from '@/shared/lib/constants';
import { formatDateTime, getInitials } from '@/shared/lib/utils';
import { Activity } from 'lucide-react';
import type { DashboardStats } from '../types';

interface RecentActivityProps {
  activities?: DashboardStats['activities'];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="card-hover border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">فعالیت‌های اخیر</CardTitle>
          <CardDescription>فعالیتی برای نمایش وجود ندارد</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="فعالیتی برای نمایش وجود ندارد"
            description="با ایجاد و بروزرسانی تسک‌ها، فعالیت‌ها اینجا نمایش داده می‌شوند"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">فعالیت‌های اخیر</CardTitle>
        <CardDescription>آخرین تغییرات در پروژه‌ها</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="max-h-80 space-y-5 overflow-y-auto px-6 py-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="ring-border h-9 w-9 shrink-0 ring-2">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(activity.assignee)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.assignee}</span>{' '}
                  <span className="text-muted-foreground">
                    تسک «{activity.title}» را در {activity.projectName} بروزرسانی کرد
                  </span>
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge
                    status={activity.status}
                    label={TASK_STATUS_LABELS[activity.status] || activity.status}
                    variant="solid"
                    size="xs"
                  />
                  <span className="text-muted-foreground text-[10px]">
                    {formatDateTime(activity.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

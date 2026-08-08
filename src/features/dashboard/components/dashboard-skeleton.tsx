import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Row 1: Stats Cards (4 columns) ── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="border-border/50 bg-card dark:border-border/30 dark:bg-card/80 relative overflow-hidden border shadow-sm"
          >
            <div className="skeleton-shimmer absolute inset-0" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-16 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 2: Tasks Overview + Project Health (2 columns) ── */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* My Tasks Overview skeleton */}
        <Card className="border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-2 w-full rounded-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Health skeleton */}
        <Card className="border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl p-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Chart (full width) ── */}
      <Card className="border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-75 w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* ── Row 4: Deadlines + Activity (2 columns) ── */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines skeleton */}
        <Card className="border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border p-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity skeleton */}
        <Card className="border-border/50 bg-card dark:border-border/30 dark:bg-card/80 border shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from '@/shared/lib/utils';
import { KANBAN_COLUMNS } from '../constants';
import { TaskCardSkeleton } from './task-card-skeleton';

export function KanbanBoardSkeleton() {
  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-4 md:mx-0 md:px-0">
      <div className="grid min-w-[320px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="bg-muted/30 flex flex-col rounded-2xl p-3">
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className={cn('h-3 w-3 rounded-full', col.color)} />
              <h3 className="text-foreground text-sm font-semibold">{col.title}</h3>
              <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                ۰
              </span>
            </div>
            <div className="flex min-h-50 flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

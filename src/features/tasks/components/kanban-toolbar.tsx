'use client';

import type { Project } from '@/features/projects/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SearchInputURL } from '@/shared/components/ui/search-input-url';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { canCreateTask } from '@/shared/lib/permissions';
import { cn } from '@/shared/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpDown,
  Columns,
  FolderKanban,
  List,
  Plus,
  RotateCcw,
  Signal,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'جدیدترین' },
  { value: 'createdAt_asc', label: 'قدیمی‌ترین' },
  { value: 'dueDate_asc', label: 'موعد (نزدیک‌ترین)' },
  { value: 'dueDate_desc', label: 'موعد (دورترین)' },
  { value: 'priority_asc', label: 'اولویت (کم→زیاد)' },
  { value: 'priority_desc', label: 'اولویت (زیاد→کم)' },
] as const;

interface KanbanToolbarProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (v: string) => void;
  combinedSort: string;
  setCombinedSort: (v: string) => void;
  viewMode: 'kanban' | 'list';
  setViewMode: (v: 'kanban' | 'list') => void;
  onCreateClick: () => void;
  onClearFilters: () => void;
  onMembersClick?: () => void;
  members?: { user: { id: string; name: string } }[];
  searchQuery?: string;
  user?: { id: string; role?: string | null } | null;
}

export function KanbanToolbar({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  combinedSort,
  setCombinedSort,
  viewMode,
  setViewMode,
  onCreateClick,
  onClearFilters,
  onMembersClick,
  searchQuery,
  members = [],
  user,
}: KanbanToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedProjectId !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (assigneeFilter !== 'all') count++;
    if (combinedSort !== 'createdAt_desc') count++;
    return count;
  }, [selectedProjectId, priorityFilter, assigneeFilter, combinedSort]);

  const hasActiveFilters = activeFilterCount > 0;

  const currentProject =
    selectedProjectId !== 'all' ? projects.find((p) => p.id === selectedProjectId) : null;
  const userCanCreate = currentProject ? canCreateTask(user, currentProject) : true;

  return (
    <div className="bg-muted/30 space-y-2 rounded-2xl p-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <SearchInputURL placeholder="جستجو..." className="min-w-0 flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            'relative h-9 gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-all sm:px-3',
            filtersOpen
              ? 'bg-primary/10 text-primary'
              : hasActiveFilters
                ? 'bg-primary/5 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">فیلترها</span>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 gap-1 rounded-xl px-2.5 text-xs font-medium transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">حذف فیلترها</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {userCanCreate && (
          <Button
            size="sm"
            onClick={onCreateClick}
            className="shadow-primary/20 h-8 shrink-0 gap-1.5 px-2 shadow-lg sm:px-3"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">تسک جدید</span>
          </Button>
        )}
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-background h-8 w-full flex-1 rounded-lg border-0 text-[11px] focus:ring-0 focus:outline-none sm:w-auto [&>span]:truncate">
                    <FolderKanban className="text-muted-foreground mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <SelectValue placeholder="پروژه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه پروژه‌ها</SelectItem>
                    {projects.map((p) => {
                      const memberRole = p.members?.find((m) => m.userId === user?.id)?.role;
                      const isOwner = p.ownerId === user?.id;
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <span className="max-w-25 truncate sm:max-w-30">{p.name}</span>
                            {isOwner && (
                              <Badge
                                variant="outline"
                                className="shrink-0 border-amber-500/50 text-[9px] text-amber-500"
                              >
                                مالک
                              </Badge>
                            )}
                            {!isOwner && memberRole === 'ADMIN' && (
                              <Badge
                                variant="outline"
                                className="border-primary/50 text-primary shrink-0 text-[9px]"
                              >
                                مدیر
                              </Badge>
                            )}
                            {!isOwner && memberRole === 'MANAGER' && (
                              <Badge
                                variant="outline"
                                className="shrink-0 border-blue-500/50 text-[9px] text-blue-500"
                              >
                                مدیر پروژه
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {selectedProjectId !== 'all' && (
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="bg-background h-8 w-full flex-1 rounded-lg border-0 text-[11px] focus:ring-0 focus:outline-none sm:w-auto [&>span]:truncate">
                      <UserCheck className="text-muted-foreground mr-1.5 h-3.5 w-3.5 shrink-0" />
                      <SelectValue placeholder="واگذار به" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>
                          {m.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="bg-background h-8 w-full flex-1 rounded-lg border-0 text-[11px] focus:ring-0 focus:outline-none sm:w-auto [&>span]:truncate">
                    <Signal className="text-muted-foreground mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <SelectValue placeholder="اولویت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="LOW">کم</SelectItem>
                    <SelectItem value="MEDIUM">متوسط</SelectItem>
                    <SelectItem value="HIGH">زیاد</SelectItem>
                    <SelectItem value="URGENT">فوری</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={combinedSort} onValueChange={setCombinedSort}>
                  <SelectTrigger className="bg-background h-8 w-full flex-1 rounded-lg border-0 text-[11px] focus:ring-0 focus:outline-none sm:w-auto [&>span]:truncate">
                    <ArrowUpDown className="text-muted-foreground mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <SelectValue placeholder="مرتب‌سازی" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex w-full gap-2 sm:w-auto">
                  <div className="bg-background flex h-8 w-full items-center gap-0.5 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('kanban')}
                      className={cn(
                        'flex flex-1 cursor-pointer! items-center justify-center rounded-lg p-1.5 transition-all',
                        viewMode === 'kanban'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Columns className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'flex flex-1 cursor-pointer! items-center justify-center rounded-lg p-1.5 transition-all',
                        viewMode === 'list'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';
import type { Task } from '../types';
import { useTaskDragDrop } from './use-task-drag-drop';
import { useTasks } from './use-tasks';

export function useKanbanBoard() {
  const { projects } = useProjects();
  const { user } = useAuth();
  const currentUserId = user?.id;

  // ── URL‑based filters ──
  const [searchQuery, setSearchQuery] = useQueryState('q', { defaultValue: '' });
  const [selectedProjectId, setSelectedProjectId] = useQueryState('project', {
    defaultValue: 'all',
  });
  const [priorityFilter, setPriorityFilter] = useQueryState('priority', { defaultValue: 'all' });
  const [assigneeFilter, setAssigneeFilter] = useQueryState('assignee', { defaultValue: 'all' });
  const [combinedSort, setCombinedSort] = useQueryState('sort', { defaultValue: 'createdAt_desc' });

  // ── Local UI state (not in URL) ──
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // ── Derived sort values ──
  const [sortBy, sortOrder] = useMemo(() => {
    const [field, order] = combinedSort.split('_');
    return [field || 'createdAt', order || 'desc'];
  }, [combinedSort]);

  // ── API filters ──
  const filters = useMemo(
    () => ({
      projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      assigneeId: assigneeFilter !== 'all' ? assigneeFilter : undefined,
      q: searchQuery || undefined,
      sortBy,
      sortOrder,
    }),
    [selectedProjectId, priorityFilter, assigneeFilter, searchQuery, sortBy, sortOrder]
  );

  // ── Data ──
  const { tasks, isLoading, isError, updateTask, deleteTask, isDeleting } = useTasks(filters);

  // ── Drag & drop ──
  const { draggedTask, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useTaskDragDrop((id, status) => updateTask({ id, data: { status } }));

  // ── Dialogs state ──
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // ── Handlers ──
  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback((open: boolean) => setCreateOpen(open), []);

  const handleEdit = useCallback((task: Task) => setEditingTask(task), []);
  const closeEdit = useCallback((open: boolean) => {
    if (!open) setEditingTask(null);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => setDeletingTaskId(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      setDeletingTaskId(null);
    }
  }, [deletingTaskId, deleteTask]);
  const closeDelete = useCallback(() => setDeletingTaskId(null), []);

  const handleView = useCallback((task: Task) => setViewingTask(task), []);
  const closeView = useCallback((open: boolean) => {
    if (!open) setViewingTask(null);
  }, []);

  // ── Kanban columns ──
  const columns = useMemo(
    () =>
      [
        { id: 'TODO', title: 'انجام نشده', color: 'bg-gray-500', borderColor: 'border-gray-500' },
        {
          id: 'IN_PROGRESS',
          title: 'در حال انجام',
          color: 'bg-blue-500',
          borderColor: 'border-blue-500',
        },
        {
          id: 'REVIEW',
          title: 'در بازبینی',
          color: 'bg-orange-500',
          borderColor: 'border-orange-500',
        },
        {
          id: 'DONE',
          title: 'انجام شده',
          color: 'bg-emerald-500',
          borderColor: 'border-emerald-500',
        },
      ].map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.status === col.id),
      })),
    [tasks]
  );

  const clearFilters = useCallback(() => {
    setSelectedProjectId('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setCombinedSort('createdAt_desc');
    setSearchQuery(null);
  }, [setSelectedProjectId, setPriorityFilter, setAssigneeFilter, setCombinedSort, setSearchQuery]);

  const hasNoTasks = tasks.length === 0;

  return {
    // data
    tasks,
    isLoading,
    isError,
    isDeleting,
    hasNoTasks,
    columns,
    projects,
    searchQuery,

    // filters state + setters (all URL-based)
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

    // drag & drop
    draggedTask,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,

    // dialogs
    createOpen,
    editingTask,
    deletingTaskId,
    viewingTask,
    openCreate,
    closeCreate,
    handleEdit,
    closeEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    closeDelete,
    handleView,
    closeView,
    clearFilters,
  };
}

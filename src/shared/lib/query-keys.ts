export const queryKeys = {
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
    profile: ['users', 'profile'] as const,
  },
  projects: {
    all: ['projects'] as const,
    byId: (id: string) => ['projects', id] as const,
    list: (filters?: Record<string, string | undefined>) =>
      ['projects', 'list', filters ?? {}] as const,
    members: (projectId: string) => ['projects', projectId, 'members'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byId: (id: string) => ['tasks', 'detail', id] as const,
    list: (filters?: Record<string, string | undefined>) =>
      ['tasks', 'list', filters ?? {}] as const,
    byProject: (projectId: string, filters?: Record<string, string | undefined>) =>
      ['tasks', 'project', projectId, filters ?? {}] as const,
    comments: (taskId: string) => ['tasks', taskId, 'comments'] as const,
  },
  chat: {
    all: ['chat'] as const,
    rooms: (projectId: string) => ['chat', 'rooms', projectId] as const,
    messages: (roomId: string) => ['chat', 'messages', roomId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: ['dashboard', 'activity'] as const,
  },
} as const;

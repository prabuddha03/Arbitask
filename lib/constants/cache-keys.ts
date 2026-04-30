/**
 * @fileoverview Cache key patterns for Arbitask
 *
 * Centralized cache key builders. Use these to avoid typos in cache key strings.
 */

export const CACHE_KEYS = {
  // Projects
  project: (id: string) => `project:${id}`,
  projectList: (userId: string) => `project:list:${userId}`,

  // Tasks
  task: (id: string) => `task:${id}`,
  tasksByProject: (projectId: string) => `task:project:${projectId}`,

  // Notes
  note: (id: string) => `note:${id}`,
  notesByProject: (projectId: string) => `note:project:${projectId}`,

  // Members
  member: (projectId: string, userId: string) => `member:${projectId}:${userId}`,
  membersByProject: (projectId: string) => `member:list:${projectId}`,

  // Invites
  invite: (token: string) => `invite:${token}`,

  // Gamification
  userXP: (userId: string) => `gamification:xp:${userId}`,
  userAchievements: (userId: string) => `gamification:achievements:${userId}`,

  // Health
  dbHealth: () => "health:db",
} as const;

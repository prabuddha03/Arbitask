/**
 * @fileoverview TTL (Time To Live) configuration for Arbitask caching
 *
 * All values are in seconds. Used by memory cache and future Redis implementations.
 */

export const CACHE_PREFIX = "arbitask";

export const TTL = {
  // Session data
  SESSION: 60 * 60 * 24, // 24 hours

  // Project data — relatively stable
  PROJECT: 60 * 5, // 5 minutes
  PROJECT_LIST: 60 * 2, // 2 minutes

  // Task data — changes frequently
  TASK: 60 * 2, // 2 minutes
  TASK_LIST: 60 * 1, // 1 minute

  // Note data
  NOTE: 60 * 5, // 5 minutes

  // Member / invite data
  MEMBER: 60 * 10, // 10 minutes
  INVITE: 60 * 60 * 48, // 48 hours

  // Gamification — XP and achievements (less frequent updates)
  GAMIFICATION: 60 * 15, // 15 minutes

  // Health check
  HEALTH: 60, // 1 minute
} as const;

export type TTLKey = keyof typeof TTL;

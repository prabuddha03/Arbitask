/**
 * @fileoverview Gamification Service — XP calculation, levels, and achievements
 *
 * This module re-exports the gamification logic from lib/gamification.ts
 * and will be expanded with additional features (leaderboards, streaks, etc.)
 *
 * NOTE: The core calcStats() function is currently in lib/gamification.ts
 * and imported by components directly. This service wraps it for the
 * module pattern and will eventually own all gamification logic.
 */

// Re-export from lib for backwards compatibility
export { calcStats } from "@/lib/gamification";

// Future additions:
// - Leaderboard queries
// - Streak calculations
// - Achievement unlock triggers
// - XP history tracking

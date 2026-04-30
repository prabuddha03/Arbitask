/**
 * @fileoverview Event name constants for the event bus
 *
 * Centralized event naming with type safety
 */

export const EVENTS = {
  // User events
  USER: {
    REGISTERED: "user.registered",
    EMAIL_VERIFIED: "user.email_verified",
    PHONE_VERIFIED: "user.phone_verified",
    PROFILE_UPDATED: "user.profile_updated",
    DELETED: "user.deleted",
    PASSWORD_RESET: "user.password_reset",
  },

  // Thread/Article events
  THREAD: {
    CREATED: "thread.created",
    PUBLISHED: "thread.published",
    UPDATED: "thread.updated",
    DELETED: "thread.deleted",
    VIEWED: "thread.viewed",
    LIKED: "thread.liked",
    DISLIKED: "thread.disliked",
    SHARED: "thread.shared",
    COMMENTED: "thread.commented",
  },

  // Writer events
  WRITER: {
    CREATED: "writer.created",
    UPDATED: "writer.updated",
    VERIFIED: "writer.verified",
    FOLLOWED: "writer.followed",
    UNFOLLOWED: "writer.unfollowed",
  },

  // Product/Book events
  PRODUCT: {
    CREATED: "product.created",
    UPDATED: "product.updated",
    DELETED: "product.deleted",
    REVIEWED: "product.reviewed",
    WISHLISTED: "product.wishlisted",
    STOCK_UPDATED: "product.stock_updated",
  },

  // Order events
  ORDER: {
    CREATED: "order.created",
    UPDATED: "order.updated",
    STATUS_CHANGED: "order.status_changed",
    CANCELLED: "order.cancelled",
    DELIVERED: "order.delivered",
    RETURNED: "order.returned",
  },

  // Payment events
  PAYMENT: {
    INITIATED: "payment.initiated",
    COMPLETED: "payment.completed",
    FAILED: "payment.failed",
    REFUNDED: "payment.refunded",
  },

  // Comment events
  COMMENT: {
    CREATED: "comment.created",
    UPDATED: "comment.updated",
    DELETED: "comment.deleted",
    REPLIED: "comment.replied",
  },

  // Review events
  REVIEW: {
    CREATED: "review.created",
    UPDATED: "review.updated",
    DELETED: "review.deleted",
    REPLIED: "review.replied",
  },

  // Notification events
  NOTIFICATION: {
    CREATED: "notification.created",
    READ: "notification.read",
    DELETED: "notification.deleted",
  },

  // Newsletter events
  NEWSLETTER: {
    SUBSCRIBED: "newsletter.subscribed",
    UNSUBSCRIBED: "newsletter.unsubscribed",
  },

  // Submission events
  SUBMISSION: {
    ARTICLE_SUBMITTED: "submission.article_submitted",
    ARTICLE_APPROVED: "submission.article_approved",
    ARTICLE_REJECTED: "submission.article_rejected",
    BOOK_PITCH_SUBMITTED: "submission.book_pitch_submitted",
    BOOK_PITCH_REVIEWED: "submission.book_pitch_reviewed",
  },

  // Event (as in physical event) events
  EVENT: {
    CREATED: "event.created",
    UPDATED: "event.updated",
    PUBLISHED: "event.published",
    CANCELLED: "event.cancelled",
  },

  // System events
  SYSTEM: {
    CACHE_CLEARED: "system.cache_cleared",
    MAINTENANCE_MODE: "system.maintenance_mode",
    BACKUP_COMPLETED: "system.backup_completed",
  },
} as const;

/**
 * Extract all event names as a union type
 */
type EventCategory = typeof EVENTS;
type EventNames<T> = T extends Record<string, infer U> ? U : never;
export type AllEventNames = EventNames<EventCategory[keyof EventCategory]>;

/**
 * Helper to get all events from a category
 */
export function getCategoryEvents(category: keyof typeof EVENTS): string[] {
  return Object.values(EVENTS[category]);
}

/**
 * Helper to check if an event belongs to a category
 */
export function isEventInCategory(event: string, category: keyof typeof EVENTS): boolean {
  return getCategoryEvents(category).includes(event);
}

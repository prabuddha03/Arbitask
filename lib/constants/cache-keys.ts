/**
 * @fileoverview Cache key patterns and builders
 *
 * Centralized cache key management with type safety
 */

export const CACHE_KEYS = {
  // User keys
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userByUsername: (username: string) => `user:username:${username}`,
  userProfile: (id: string) => `user:${id}:profile`,
  userPreferences: (id: string) => `user:${id}:preferences`,
  userActivityMetrics: (id: string) => `user:${id}:activity`,

  // Thread/Article keys
  thread: (id: string) => `thread:${id}`,
  threadBySlug: (slug: string) => `thread:slug:${slug}`,
  threadList: (page: number, limit: number) => `thread:list:${page}:${limit}`,
  threadsByCategory: (category: string, page: number) => `thread:category:${category}:${page}`,
  threadsByWriter: (writerId: string, page: number) => `thread:writer:${writerId}:${page}`,
  threadMetrics: (threadId: string) => `thread:${threadId}:metrics`,
  threadViews: (threadId: string) => `thread:${threadId}:views`,
  threadLikes: (threadId: string) => `thread:${threadId}:likes`,
  threadComments: (threadId: string) => `thread:${threadId}:comments`,

  // Writer keys
  writer: (id: string) => `writer:${id}`,
  writerBySlug: (slug: string) => `writer:slug:${slug}`,
  writerProfile: (id: string) => `writer:${id}:profile`,
  writerMetrics: (id: string) => `writer:${id}:metrics`,
  writerFollowers: (id: string) => `writer:${id}:followers`,
  writerArticleCount: (id: string) => `writer:${id}:articles:count`,

  // Product/Book keys
  product: (id: string) => `product:${id}`,
  productBySlug: (slug: string) => `product:slug:${slug}`,
  productList: (page: number, limit: number) => `product:list:${page}:${limit}`,
  productsByCategory: (categoryId: string, page: number) =>
    `product:category:${categoryId}:${page}`,
  productMetrics: (productId: string) => `product:${productId}:metrics`,
  productReviews: (productId: string, page: number) => `product:${productId}:reviews:${page}`,

  // Order keys
  order: (id: string) => `order:${id}`,
  ordersByUser: (userId: string, page: number) => `order:user:${userId}:${page}`,

  // Cart keys
  cart: (userId: string) => `cart:user:${userId}`,
  cartItems: (userId: string) => `cart:user:${userId}:items`,

  // Homepage keys
  homepageSections: () => `homepage:sections`,
  homepageFeatured: () => `homepage:featured`,
  homepageBanner: () => `homepage:banner`,

  // Search keys
  searchResults: (query: string, page: number) => `search:${query}:${page}`,

  // Comment keys
  threadCommentsList: (threadId: string, page: number) => `thread:${threadId}:comments:${page}`,

  // Tag keys
  tagsByType: (type: string) => `tags:type:${type}`,

  // Topic keys
  topics: () => `topics:all`,
  topicBySlug: (slug: string) => `topics:slug:${slug}`,

  // Language keys
  languages: () => `languages:all`,
  language: (id: number) => `languages:id:${id}`,
  languageByCode: (code: string) => `languages:code:${code}`,

  // User follow keys
  userFollowers: (userId: number, limit: number, offset: number) =>
    `user:${userId}:followers:${limit}:${offset}`,
  userFollowing: (userId: number, limit: number, offset: number) =>
    `user:${userId}:following:${limit}:${offset}`,
  userFollowStatus: (followerId: number, followedId: number) =>
    `user:${followerId}:follows:${followedId}`,

  // Column follow keys
  columnFollowers: (columnId: number, limit: number, offset: number) =>
    `column:${columnId}:followers:${limit}:${offset}`,
  userFollowingColumns: (userId: number, limit: number, offset: number) =>
    `user:${userId}:following:columns:${limit}:${offset}`,
  columnFollowStatus: (followerId: number, columnId: number) =>
    `user:${followerId}:follows:column:${columnId}`,

  // Event keys
  eventList: (page: number) => `events:list:${page}`,
  event: (id: string) => `event:${id}`,

  // Newsletter keys
  newsletterSubscription: (email: string) => `newsletter:${email}`,
} as const;

/**
 * Pattern matchers for bulk cache invalidation
 */
export const CACHE_PATTERNS = {
  allUsers: () => `user:*`,
  allThreads: () => `thread:*`,
  allThreadsByWriter: (writerId: string) => `thread:writer:${writerId}:*`,
  allProducts: () => `product:*`,
  allOrders: () => `order:*`,
  allSearchResults: () => `search:*`,
  userAll: (userId: string) => `user:${userId}:*`,
  threadAll: (threadId: string) => `thread:${threadId}:*`,
  writerAll: (writerId: string) => `writer:${writerId}:*`,
  productAll: (productId: string) => `product:${productId}:*`,
} as const;

/**
 * Helper to build custom cache keys
 */
export function buildCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join(":");
}

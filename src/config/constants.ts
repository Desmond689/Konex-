// src/config/constants.ts
export const APP_CONSTANTS = {
  // Auth
  AUTH: {
    SESSION_KEY: '@konex/auth/session',
    USER_KEY: '@konex/auth/user',
    TOKEN_REFRESH_INTERVAL: 1000 * 60 * 30, // 30 minutes
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    INITIAL_PAGE: 0,
  },

  // Cache
  CACHE: {
    STALE_TIME: 1000 * 60 * 5, // 5 minutes
    CACHE_TIME: 1000 * 60 * 30, // 30 minutes
  },

  // Chat
  CHAT: {
    MESSAGE_PREVIEW_LENGTH: 50,
    TYPING_INDICATOR_DELAY: 1000,
    MAX_MESSAGE_LENGTH: 1000,
  },

  // Upload
  UPLOAD: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  },

  // Squad
  SQUAD: {
    MAX_MEMBERS: 20,
    MAX_NAME_LENGTH: 30,
    MAX_TAG_LENGTH: 5,
    MAX_DESCRIPTION_LENGTH: 500,
    DELETE_GRACE_PERIOD_DAYS: 7,
  },

  // Tournaments
  TOURNAMENT: {
    MAX_SQUADS: 32,
    MIN_SQUADS: 4,
    DEFAULT_MAX_SQUADS: 16,
  },

  // Badges
  BADGE: {
    MAX_FEATURED: 6,
  },

  // Storage Keys
  STORAGE_KEYS: {
    THEME: '@konex/theme',
    ONBOARDING: '@konex/onboarding',
    NOTIFICATIONS: '@konex/notifications',
    PUSH_TOKEN: '@konex/push_token',
    LAST_ACTIVE: '@konex/last_active',
  },
};
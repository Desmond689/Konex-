/**
 * KONEX Error Codes
 * Billion Dollar Code - Production Ready
 * Comprehensive error code system with categories
 */

// ============================================
// 1. ERROR CODES
// ============================================

export enum ErrorCode {
  // ============================================
  // Auth Errors (AUTH_*)
  // ============================================
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_EXISTS = 'AUTH_EMAIL_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  AUTH_ACCOUNT_DISABLED = 'AUTH_ACCOUNT_DISABLED',
  AUTH_TOO_MANY_ATTEMPTS = 'AUTH_TOO_MANY_ATTEMPTS',

  // ============================================
  // Database Errors (DB_*)
  // ============================================
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  DB_RECORD_NOT_FOUND = 'DB_RECORD_NOT_FOUND',
  DB_DUPLICATE_RECORD = 'DB_DUPLICATE_RECORD',
  DB_PERMISSION_DENIED = 'DB_PERMISSION_DENIED',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  DB_TRANSACTION_ERROR = 'DB_TRANSACTION_ERROR',
  DB_TIMEOUT_ERROR = 'DB_TIMEOUT_ERROR',

  // ============================================
  // Storage Errors (STORAGE_*)
  // ============================================
  STORAGE_UPLOAD_ERROR = 'STORAGE_UPLOAD_ERROR',
  STORAGE_DOWNLOAD_ERROR = 'STORAGE_DOWNLOAD_ERROR',
  STORAGE_FILE_NOT_FOUND = 'STORAGE_FILE_NOT_FOUND',
  STORAGE_PERMISSION_DENIED = 'STORAGE_PERMISSION_DENIED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_INVALID_FILE = 'STORAGE_INVALID_FILE',

  // ============================================
  // Network Errors (NETWORK_*)
  // ============================================
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_UNKNOWN = 'NETWORK_UNKNOWN',
  NETWORK_DNS_ERROR = 'NETWORK_DNS_ERROR',
  NETWORK_SSL_ERROR = 'NETWORK_SSL_ERROR',

  // ============================================
  // Validation Errors (VALIDATION_*)
  // ============================================
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PASSWORD = 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_INVALID_USERNAME = 'VALIDATION_INVALID_USERNAME',
  VALIDATION_INVALID_GAMER_TAG = 'VALIDATION_INVALID_GAMER_TAG',
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_LENGTH = 'VALIDATION_INVALID_LENGTH',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_URL = 'VALIDATION_INVALID_URL',
  VALIDATION_INVALID_PHONE = 'VALIDATION_INVALID_PHONE',

  // ============================================
  // Squad Errors (SQUAD_*)
  // ============================================
  SQUAD_ALREADY_MEMBER = 'SQUAD_ALREADY_MEMBER',
  SQUAD_FULL = 'SQUAD_FULL',
  SQUAD_NOT_FOUND = 'SQUAD_NOT_FOUND',
  SQUAD_INVITE_ONLY = 'SQUAD_INVITE_ONLY',
  SQUAD_ALREADY_LEADER = 'SQUAD_ALREADY_LEADER',
  SQUAD_CANNOT_KICK_LEADER = 'SQUAD_CANNOT_KICK_LEADER',
  SQUAD_LEADER_CANNOT_LEAVE = 'SQUAD_LEADER_CANNOT_LEAVE',
  SQUAD_ALREADY_JOINED = 'SQUAD_ALREADY_JOINED',
  SQUAD_INVITE_EXPIRED = 'SQUAD_INVITE_EXPIRED',
  SQUAD_INVITE_INVALID = 'SQUAD_INVITE_INVALID',

  // ============================================
  // Post Errors (POST_*)
  // ============================================
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  POST_ALREADY_LIKED = 'POST_ALREADY_LIKED',
  POST_ALREADY_SAVED = 'POST_ALREADY_SAVED',
  POST_DELETED = 'POST_DELETED',
  POST_ARCHIVED = 'POST_ARCHIVED',

  // ============================================
  // Comment Errors (COMMENT_*)
  // ============================================
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  COMMENT_DELETED = 'COMMENT_DELETED',

  // ============================================
  // Tournament Errors (TOURNAMENT_*)
  // ============================================
  TOURNAMENT_NOT_FOUND = 'TOURNAMENT_NOT_FOUND',
  TOURNAMENT_FULL = 'TOURNAMENT_FULL',
  TOURNAMENT_CLOSED = 'TOURNAMENT_CLOSED',
  TOURNAMENT_ALREADY_REGISTERED = 'TOURNAMENT_ALREADY_REGISTERED',

  // ============================================
  // LFG Errors (LFG_*)
  // ============================================
  LFG_NOT_FOUND = 'LFG_NOT_FOUND',
  LFG_FULL = 'LFG_FULL',
  LFG_EXPIRED = 'LFG_EXPIRED',

  // ============================================
  // Chat Errors (CHAT_*)
  // ============================================
  CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
  CHAT_ALREADY_READ = 'CHAT_ALREADY_READ',

  // ============================================
  // Badge Errors (BADGE_*)
  // ============================================
  BADGE_NOT_FOUND = 'BADGE_NOT_FOUND',
  BADGE_ALREADY_EARNED = 'BADGE_ALREADY_EARNED',

  // ============================================
  // Report Errors (REPORT_*)
  // ============================================
  REPORT_ALREADY_SUBMITTED = 'REPORT_ALREADY_SUBMITTED',
  REPORT_NOT_FOUND = 'REPORT_NOT_FOUND',

  // ============================================
  // General Errors
  // ============================================
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
}

// ============================================
// 2. ERROR SEVERITY
// ============================================

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// ============================================
// 3. ERROR CATEGORIES
// ============================================

export const ErrorCategories: Record<string, ErrorCode[]> = {
  AUTH: [
    ErrorCode.AUTH_INVALID_CREDENTIALS,
    ErrorCode.AUTH_USER_NOT_FOUND,
    ErrorCode.AUTH_EMAIL_EXISTS,
    ErrorCode.AUTH_WEAK_PASSWORD,
    ErrorCode.AUTH_SESSION_EXPIRED,
    ErrorCode.AUTH_UNAUTHORIZED,
    ErrorCode.AUTH_TOKEN_INVALID,
    ErrorCode.AUTH_TOKEN_EXPIRED,
    ErrorCode.AUTH_ACCOUNT_LOCKED,
    ErrorCode.AUTH_ACCOUNT_DISABLED,
    ErrorCode.AUTH_TOO_MANY_ATTEMPTS,
  ],
  DATABASE: [
    ErrorCode.DB_CONNECTION_ERROR,
    ErrorCode.DB_QUERY_ERROR,
    ErrorCode.DB_RECORD_NOT_FOUND,
    ErrorCode.DB_DUPLICATE_RECORD,
    ErrorCode.DB_PERMISSION_DENIED,
    ErrorCode.DB_CONSTRAINT_VIOLATION,
    ErrorCode.DB_TRANSACTION_ERROR,
    ErrorCode.DB_TIMEOUT_ERROR,
  ],
  STORAGE: [
    ErrorCode.STORAGE_UPLOAD_ERROR,
    ErrorCode.STORAGE_DOWNLOAD_ERROR,
    ErrorCode.STORAGE_FILE_NOT_FOUND,
    ErrorCode.STORAGE_PERMISSION_DENIED,
    ErrorCode.STORAGE_QUOTA_EXCEEDED,
    ErrorCode.STORAGE_INVALID_FILE,
  ],
  NETWORK: [
    ErrorCode.NETWORK_OFFLINE,
    ErrorCode.NETWORK_TIMEOUT,
    ErrorCode.NETWORK_UNKNOWN,
    ErrorCode.NETWORK_DNS_ERROR,
    ErrorCode.NETWORK_SSL_ERROR,
  ],
  VALIDATION: [
    ErrorCode.VALIDATION_INVALID_EMAIL,
    ErrorCode.VALIDATION_INVALID_PASSWORD,
    ErrorCode.VALIDATION_INVALID_USERNAME,
    ErrorCode.VALIDATION_INVALID_GAMER_TAG,
    ErrorCode.VALIDATION_REQUIRED_FIELD,
    ErrorCode.VALIDATION_INVALID_LENGTH,
    ErrorCode.VALIDATION_INVALID_FORMAT,
    ErrorCode.VALIDATION_INVALID_URL,
    ErrorCode.VALIDATION_INVALID_PHONE,
  ],
  SQUAD: [
    ErrorCode.SQUAD_ALREADY_MEMBER,
    ErrorCode.SQUAD_FULL,
    ErrorCode.SQUAD_NOT_FOUND,
    ErrorCode.SQUAD_INVITE_ONLY,
    ErrorCode.SQUAD_ALREADY_LEADER,
    ErrorCode.SQUAD_CANNOT_KICK_LEADER,
    ErrorCode.SQUAD_LEADER_CANNOT_LEAVE,
    ErrorCode.SQUAD_ALREADY_JOINED,
    ErrorCode.SQUAD_INVITE_EXPIRED,
    ErrorCode.SQUAD_INVITE_INVALID,
  ],
  POST: [
    ErrorCode.POST_NOT_FOUND,
    ErrorCode.POST_ALREADY_LIKED,
    ErrorCode.POST_ALREADY_SAVED,
    ErrorCode.POST_DELETED,
    ErrorCode.POST_ARCHIVED,
  ],
  COMMENT: [
    ErrorCode.COMMENT_NOT_FOUND,
    ErrorCode.COMMENT_DELETED,
  ],
  TOURNAMENT: [
    ErrorCode.TOURNAMENT_NOT_FOUND,
    ErrorCode.TOURNAMENT_FULL,
    ErrorCode.TOURNAMENT_CLOSED,
    ErrorCode.TOURNAMENT_ALREADY_REGISTERED,
  ],
  LFG: [
    ErrorCode.LFG_NOT_FOUND,
    ErrorCode.LFG_FULL,
    ErrorCode.LFG_EXPIRED,
  ],
  CHAT: [
    ErrorCode.CHAT_NOT_FOUND,
    ErrorCode.CHAT_ALREADY_READ,
  ],
  BADGE: [
    ErrorCode.BADGE_NOT_FOUND,
    ErrorCode.BADGE_ALREADY_EARNED,
  ],
  REPORT: [
    ErrorCode.REPORT_ALREADY_SUBMITTED,
    ErrorCode.REPORT_NOT_FOUND,
  ],
  GENERAL: [
    ErrorCode.UNKNOWN_ERROR,
    ErrorCode.BAD_REQUEST,
    ErrorCode.INTERNAL_SERVER_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.RATE_LIMIT_EXCEEDED,
    ErrorCode.MAINTENANCE_MODE,
  ],
};

// ============================================
// 4. ERROR MESSAGES
// ============================================

export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth Errors
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email.',
  [ErrorCode.AUTH_EMAIL_EXISTS]: 'An account with this email already exists.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password is too weak. Please use a stronger password.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid authentication token.',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired.',
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: 'Your account has been locked. Please contact support.',
  [ErrorCode.AUTH_ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support.',
  [ErrorCode.AUTH_TOO_MANY_ATTEMPTS]: 'Too many login attempts. Please try again later.',

  // Database Errors
  [ErrorCode.DB_CONNECTION_ERROR]: 'Could not connect to the database. Please try again.',
  [ErrorCode.DB_QUERY_ERROR]: 'Something went wrong with your request.',
  [ErrorCode.DB_RECORD_NOT_FOUND]: 'The requested item could not be found.',
  [ErrorCode.DB_DUPLICATE_RECORD]: 'This record already exists.',
  [ErrorCode.DB_PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'The operation violates a database constraint.',
  [ErrorCode.DB_TRANSACTION_ERROR]: 'Database transaction failed. Please try again.',
  [ErrorCode.DB_TIMEOUT_ERROR]: 'Database operation timed out. Please try again.',

  // Storage Errors
  [ErrorCode.STORAGE_UPLOAD_ERROR]: 'Failed to upload file. Please try again.',
  [ErrorCode.STORAGE_DOWNLOAD_ERROR]: 'Failed to download file. Please try again.',
  [ErrorCode.STORAGE_FILE_NOT_FOUND]: 'The requested file could not be found.',
  [ErrorCode.STORAGE_PERMISSION_DENIED]: 'You do not have permission to access this file.',
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please free up space.',
  [ErrorCode.STORAGE_INVALID_FILE]: 'Invalid file type or format.',

  // Network Errors
  [ErrorCode.NETWORK_OFFLINE]: 'You are offline. Please check your internet connection.',
  [ErrorCode.NETWORK_TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCode.NETWORK_UNKNOWN]: 'Network error. Please try again.',
  [ErrorCode.NETWORK_DNS_ERROR]: 'DNS resolution failed. Please check your network.',
  [ErrorCode.NETWORK_SSL_ERROR]: 'SSL certificate error. Please check your network security.',

  // Validation Errors
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Please enter a valid email address.',
  [ErrorCode.VALIDATION_INVALID_PASSWORD]: 'Password must be at least 8 characters.',
  [ErrorCode.VALIDATION_INVALID_USERNAME]: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores.',
  [ErrorCode.VALIDATION_INVALID_GAMER_TAG]: 'Gamer tag must be 3-15 characters and can only contain letters, numbers, and underscores.',
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'This field is required.',
  [ErrorCode.VALIDATION_INVALID_LENGTH]: 'Invalid length for this field.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid format for this field.',
  [ErrorCode.VALIDATION_INVALID_URL]: 'Please enter a valid URL.',
  [ErrorCode.VALIDATION_INVALID_PHONE]: 'Please enter a valid phone number.',

  // Squad Errors
  [ErrorCode.SQUAD_ALREADY_MEMBER]: 'You are already a member of this squad.',
  [ErrorCode.SQUAD_FULL]: 'This squad is full.',
  [ErrorCode.SQUAD_NOT_FOUND]: 'The squad could not be found.',
  [ErrorCode.SQUAD_INVITE_ONLY]: 'This squad is invite-only.',
  [ErrorCode.SQUAD_ALREADY_LEADER]: 'You are already the leader of this squad.',
  [ErrorCode.SQUAD_CANNOT_KICK_LEADER]: 'You cannot kick the squad leader.',
  [ErrorCode.SQUAD_LEADER_CANNOT_LEAVE]: 'You must transfer leadership before leaving.',
  [ErrorCode.SQUAD_ALREADY_JOINED]: 'You have already joined this squad.',
  [ErrorCode.SQUAD_INVITE_EXPIRED]: 'This squad invite has expired.',
  [ErrorCode.SQUAD_INVITE_INVALID]: 'This squad invite is invalid.',

  // Post Errors
  [ErrorCode.POST_NOT_FOUND]: 'The post could not be found.',
  [ErrorCode.POST_ALREADY_LIKED]: 'You have already liked this post.',
  [ErrorCode.POST_ALREADY_SAVED]: 'You have already saved this post.',
  [ErrorCode.POST_DELETED]: 'This post has been deleted.',
  [ErrorCode.POST_ARCHIVED]: 'This post has been archived.',

  // Comment Errors
  [ErrorCode.COMMENT_NOT_FOUND]: 'The comment could not be found.',
  [ErrorCode.COMMENT_DELETED]: 'This comment has been deleted.',

  // Tournament Errors
  [ErrorCode.TOURNAMENT_NOT_FOUND]: 'The tournament could not be found.',
  [ErrorCode.TOURNAMENT_FULL]: 'This tournament is full.',
  [ErrorCode.TOURNAMENT_CLOSED]: 'This tournament is closed for registration.',
  [ErrorCode.TOURNAMENT_ALREADY_REGISTERED]: 'You are already registered for this tournament.',

  // LFG Errors
  [ErrorCode.LFG_NOT_FOUND]: 'The LFG post could not be found.',
  [ErrorCode.LFG_FULL]: 'This LFG group is full.',
  [ErrorCode.LFG_EXPIRED]: 'This LFG post has expired.',

  // Chat Errors
  [ErrorCode.CHAT_NOT_FOUND]: 'The chat could not be found.',
  [ErrorCode.CHAT_ALREADY_READ]: 'This message has already been read.',

  // Badge Errors
  [ErrorCode.BADGE_NOT_FOUND]: 'The badge could not be found.',
  [ErrorCode.BADGE_ALREADY_EARNED]: 'You have already earned this badge.',

  // Report Errors
  [ErrorCode.REPORT_ALREADY_SUBMITTED]: 'You have already submitted a report for this item.',
  [ErrorCode.REPORT_NOT_FOUND]: 'The report could not be found.',

  // General Errors
  [ErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is currently unavailable. Please try again later.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please slow down.',
  [ErrorCode.MAINTENANCE_MODE]: 'The app is currently under maintenance. Please check back later.',
};

// ============================================
// 5. ERROR SEVERITY MAPPING
// ============================================

export const ErrorSeverityMap: Record<ErrorCode, ErrorSeverity> = {
  // Auth Errors
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_USER_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_EMAIL_EXISTS]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_WEAK_PASSWORD]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_SESSION_EXPIRED]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_UNAUTHORIZED]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_TOKEN_INVALID]: ErrorSeverity.ERROR,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: ErrorSeverity.WARNING,
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: ErrorSeverity.ERROR,
  [ErrorCode.AUTH_ACCOUNT_DISABLED]: ErrorSeverity.ERROR,
  [ErrorCode.AUTH_TOO_MANY_ATTEMPTS]: ErrorSeverity.WARNING,

  // Database Errors
  [ErrorCode.DB_CONNECTION_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.DB_QUERY_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.DB_RECORD_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.DB_DUPLICATE_RECORD]: ErrorSeverity.WARNING,
  [ErrorCode.DB_PERMISSION_DENIED]: ErrorSeverity.WARNING,
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: ErrorSeverity.WARNING,
  [ErrorCode.DB_TRANSACTION_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.DB_TIMEOUT_ERROR]: ErrorSeverity.ERROR,

  // Storage Errors
  [ErrorCode.STORAGE_UPLOAD_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.STORAGE_DOWNLOAD_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.STORAGE_FILE_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.STORAGE_PERMISSION_DENIED]: ErrorSeverity.WARNING,
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: ErrorSeverity.WARNING,
  [ErrorCode.STORAGE_INVALID_FILE]: ErrorSeverity.WARNING,

  // Network Errors
  [ErrorCode.NETWORK_OFFLINE]: ErrorSeverity.ERROR,
  [ErrorCode.NETWORK_TIMEOUT]: ErrorSeverity.ERROR,
  [ErrorCode.NETWORK_UNKNOWN]: ErrorSeverity.ERROR,
  [ErrorCode.NETWORK_DNS_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.NETWORK_SSL_ERROR]: ErrorSeverity.ERROR,

  // Validation Errors
  [ErrorCode.VALIDATION_INVALID_EMAIL]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_PASSWORD]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_USERNAME]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_GAMER_TAG]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_LENGTH]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_URL]: ErrorSeverity.WARNING,
  [ErrorCode.VALIDATION_INVALID_PHONE]: ErrorSeverity.WARNING,

  // Squad Errors
  [ErrorCode.SQUAD_ALREADY_MEMBER]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_FULL]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_INVITE_ONLY]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_ALREADY_LEADER]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_CANNOT_KICK_LEADER]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_LEADER_CANNOT_LEAVE]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_ALREADY_JOINED]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_INVITE_EXPIRED]: ErrorSeverity.WARNING,
  [ErrorCode.SQUAD_INVITE_INVALID]: ErrorSeverity.WARNING,

  // Post Errors
  [ErrorCode.POST_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.POST_ALREADY_LIKED]: ErrorSeverity.WARNING,
  [ErrorCode.POST_ALREADY_SAVED]: ErrorSeverity.WARNING,
  [ErrorCode.POST_DELETED]: ErrorSeverity.WARNING,
  [ErrorCode.POST_ARCHIVED]: ErrorSeverity.WARNING,

  // Comment Errors
  [ErrorCode.COMMENT_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.COMMENT_DELETED]: ErrorSeverity.WARNING,

  // Tournament Errors
  [ErrorCode.TOURNAMENT_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.TOURNAMENT_FULL]: ErrorSeverity.WARNING,
  [ErrorCode.TOURNAMENT_CLOSED]: ErrorSeverity.WARNING,
  [ErrorCode.TOURNAMENT_ALREADY_REGISTERED]: ErrorSeverity.WARNING,

  // LFG Errors
  [ErrorCode.LFG_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.LFG_FULL]: ErrorSeverity.WARNING,
  [ErrorCode.LFG_EXPIRED]: ErrorSeverity.WARNING,

  // Chat Errors
  [ErrorCode.CHAT_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.CHAT_ALREADY_READ]: ErrorSeverity.WARNING,

  // Badge Errors
  [ErrorCode.BADGE_NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.BADGE_ALREADY_EARNED]: ErrorSeverity.WARNING,

  // Report Errors
  [ErrorCode.REPORT_ALREADY_SUBMITTED]: ErrorSeverity.WARNING,
  [ErrorCode.REPORT_NOT_FOUND]: ErrorSeverity.WARNING,

  // General Errors
  [ErrorCode.UNKNOWN_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.BAD_REQUEST]: ErrorSeverity.ERROR,
  [ErrorCode.INTERNAL_SERVER_ERROR]: ErrorSeverity.FATAL,
  [ErrorCode.SERVICE_UNAVAILABLE]: ErrorSeverity.ERROR,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: ErrorSeverity.WARNING,
  [ErrorCode.MAINTENANCE_MODE]: ErrorSeverity.INFO,
};

// ============================================
// 6. EXPORT DEFAULT
// ============================================

export default ErrorCode;
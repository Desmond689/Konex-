import { KonexError } from './app.error';
/**
 * KONEX Error Messages
 * Billion Dollar Code - Production Ready
 * User-friendly error messages with localization support
 */

import { ErrorCode } from './error.codes';

// ============================================
// 1. USER-FRIENDLY ERROR MESSAGES
// ============================================

export const UserErrorMessages: Record<ErrorCode, string> = {
  // Auth Errors
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'The email or password you entered is incorrect. Please try again.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'We couldn\'t find an account with this email address.',
  [ErrorCode.AUTH_EMAIL_EXISTS]: 'This email is already registered. Please sign in or use a different email.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Your password is too weak. Please use at least 8 characters with a mix of letters and numbers.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again to continue.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You don\'t have permission to perform this action.',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Your authentication token is invalid. Please sign in again.',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Your authentication token has expired. Please sign in again.',
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: 'Your account has been locked for security reasons. Please contact support.',
  [ErrorCode.AUTH_ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support for assistance.',
  [ErrorCode.AUTH_TOO_MANY_ATTEMPTS]: 'Too many failed login attempts. Please wait a few minutes before trying again.',

  // Database Errors
  [ErrorCode.DB_CONNECTION_ERROR]: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
  [ErrorCode.DB_QUERY_ERROR]: 'Something went wrong. Please try again in a moment.',
  [ErrorCode.DB_RECORD_NOT_FOUND]: 'The item you\'re looking for could not be found.',
  [ErrorCode.DB_DUPLICATE_RECORD]: 'This item already exists. Please use a different one.',
  [ErrorCode.DB_PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'This operation couldn\'t be completed because of a conflict with existing data.',
  [ErrorCode.DB_TRANSACTION_ERROR]: 'Something went wrong with your request. Please try again.',
  [ErrorCode.DB_TIMEOUT_ERROR]: 'The request took too long. Please try again.',

  // Storage Errors
  [ErrorCode.STORAGE_UPLOAD_ERROR]: 'We couldn\'t upload your file. Please check the file and try again.',
  [ErrorCode.STORAGE_DOWNLOAD_ERROR]: 'We couldn\'t download your file. Please try again.',
  [ErrorCode.STORAGE_FILE_NOT_FOUND]: 'The file you\'re looking for could not be found.',
  [ErrorCode.STORAGE_PERMISSION_DENIED]: 'You don\'t have permission to access this file.',
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'You\'ve reached your storage limit. Please free up some space.',
  [ErrorCode.STORAGE_INVALID_FILE]: 'This file type is not supported. Please use a supported format.',

  // Network Errors
  [ErrorCode.NETWORK_OFFLINE]: 'You\'re offline. Please check your internet connection and try again.',
  [ErrorCode.NETWORK_TIMEOUT]: 'The connection timed out. Please check your internet and try again.',
  [ErrorCode.NETWORK_UNKNOWN]: 'Network error. Please check your internet connection.',
  [ErrorCode.NETWORK_DNS_ERROR]: 'Could not resolve the server address. Please check your network settings.',
  [ErrorCode.NETWORK_SSL_ERROR]: 'Secure connection failed. Please check your network security settings.',

  // Validation Errors
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Please enter a valid email address (e.g., name@example.com).',
  [ErrorCode.VALIDATION_INVALID_PASSWORD]: 'Password must be at least 8 characters long.',
  [ErrorCode.VALIDATION_INVALID_USERNAME]: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores.',
  [ErrorCode.VALIDATION_INVALID_GAMER_TAG]: 'Gamer tag must be 3-15 characters and can only contain letters, numbers, and underscores.',
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'This field is required. Please fill it in.',
  [ErrorCode.VALIDATION_INVALID_LENGTH]: 'Please enter a value with the correct length.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Please enter a value in the correct format.',
  [ErrorCode.VALIDATION_INVALID_URL]: 'Please enter a valid URL (e.g., https://example.com).',
  [ErrorCode.VALIDATION_INVALID_PHONE]: 'Please enter a valid phone number.',

  // Squad Errors
  [ErrorCode.SQUAD_ALREADY_MEMBER]: 'You\'re already a member of this squad.',
  [ErrorCode.SQUAD_FULL]: 'This squad is full. Please try joining another one.',
  [ErrorCode.SQUAD_NOT_FOUND]: 'The squad you\'re looking for could not be found.',
  [ErrorCode.SQUAD_INVITE_ONLY]: 'This squad is invite-only. You need an invitation to join.',
  [ErrorCode.SQUAD_ALREADY_LEADER]: 'You\'re already the leader of this squad.',
  [ErrorCode.SQUAD_CANNOT_KICK_LEADER]: 'You cannot kick the squad leader.',
  [ErrorCode.SQUAD_LEADER_CANNOT_LEAVE]: 'You must transfer leadership before leaving the squad.',
  [ErrorCode.SQUAD_ALREADY_JOINED]: 'You\'ve already joined this squad.',
  [ErrorCode.SQUAD_INVITE_EXPIRED]: 'This squad invite has expired. Please request a new one.',
  [ErrorCode.SQUAD_INVITE_INVALID]: 'This squad invite is invalid. Please request a new one.',

  // Post Errors
  [ErrorCode.POST_NOT_FOUND]: 'The post you\'re looking for could not be found.',
  [ErrorCode.POST_ALREADY_LIKED]: 'You\'ve already liked this post.',
  [ErrorCode.POST_ALREADY_SAVED]: 'You\'ve already saved this post.',
  [ErrorCode.POST_DELETED]: 'This post has been deleted.',
  [ErrorCode.POST_ARCHIVED]: 'This post has been archived.',

  // Comment Errors
  [ErrorCode.COMMENT_NOT_FOUND]: 'The comment you\'re looking for could not be found.',
  [ErrorCode.COMMENT_DELETED]: 'This comment has been deleted.',

  // Tournament Errors
  [ErrorCode.TOURNAMENT_NOT_FOUND]: 'The tournament you\'re looking for could not be found.',
  [ErrorCode.TOURNAMENT_FULL]: 'This tournament is full. Please check back later.',
  [ErrorCode.TOURNAMENT_CLOSED]: 'Registration for this tournament is closed.',
  [ErrorCode.TOURNAMENT_ALREADY_REGISTERED]: 'You\'re already registered for this tournament.',

  // LFG Errors
  [ErrorCode.LFG_NOT_FOUND]: 'The LFG post you\'re looking for could not be found.',
  [ErrorCode.LFG_FULL]: 'This LFG group is full.',
  [ErrorCode.LFG_EXPIRED]: 'This LFG post has expired.',

  // Chat Errors
  [ErrorCode.CHAT_NOT_FOUND]: 'The chat you\'re looking for could not be found.',
  [ErrorCode.CHAT_ALREADY_READ]: 'This message has already been read.',

  // Badge Errors
  [ErrorCode.BADGE_NOT_FOUND]: 'The badge you\'re looking for could not be found.',
  [ErrorCode.BADGE_ALREADY_EARNED]: 'You\'ve already earned this badge.',

  // Report Errors
  [ErrorCode.REPORT_ALREADY_SUBMITTED]: 'You\'ve already submitted a report for this item.',
  [ErrorCode.REPORT_NOT_FOUND]: 'The report you\'re looking for could not be found.',

  // General Errors
  [ErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please slow down and try again.',
  [ErrorCode.MAINTENANCE_MODE]: 'The app is currently undergoing maintenance. Please check back later.',
};

// ============================================
// 2. LOCALIZATION SUPPORT
// ============================================

export interface ErrorMessageLocalization {
  language: string;
  messages: Partial<Record<ErrorCode, string>>;
}

export const LocalizedErrorMessages: Record<string, ErrorMessageLocalization> = {
  en: {
    language: 'en',
    messages: UserErrorMessages,
  },
  // Add more languages as needed
  // es: { language: 'es', messages: SpanishErrorMessages },
  // fr: { language: 'fr', messages: FrenchErrorMessages },
  // etc.
};

/**
 * Get user-friendly error message for a specific error code
 */
export const getUserErrorMessage = (
  code: ErrorCode,
  language: string = 'en'
): string => {
  const localization = LocalizedErrorMessages[language];
  if (!localization) {
    return UserErrorMessages[code] || 'An unexpected error occurred';
  }
  return localization.messages[code] || UserErrorMessages[code] || 'An unexpected error occurred';
};

/**
 * Get user-friendly error message from an error object
 */
export const getUserMessageFromError = (
  error: any,
  language: string = 'en'
): string => {
  if (error instanceof KonexError) {
    return getUserErrorMessage(error.code, language);
  }
  return error?.userMessage || error?.message || 'An unexpected error occurred';
};

// ============================================
// 3. EXPORT DEFAULT
// ============================================

export default UserErrorMessages;
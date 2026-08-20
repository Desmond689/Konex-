// @ts-nocheck
/**
 * KONEX Application Error
 * Billion Dollar Code - Production Ready
 * Base error class with proper typing and metadata
 */

import { ErrorCode, ErrorMessages, ErrorSeverity } from './error.codes';

// ============================================
// 1. KONEX ERROR CLASS
// ============================================

export class KonexError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: Record<string, any>,
    isOperational: boolean = true,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'KonexError';
    this.code = code;
    this.severity = severity;
    this.userMessage = userMessage;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;
    this.statusCode = statusCode;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KonexError);
    }
  }

  // ============================================
  // 2. UTILITY METHODS
  // ============================================

  /**
   * Check if the error is fatal
   */
  public isFatal(): boolean {
    return this.severity === ErrorSeverity.FATAL;
  }

  /**
   * Check if the error is a warning
   */
  public isWarning(): boolean {
    return this.severity === ErrorSeverity.WARNING;
  }

  /**
   * Check if the error is informational
   */
  public isInfo(): boolean {
    return this.severity === ErrorSeverity.INFO;
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    return this.userMessage || ErrorMessages[this.code] || 'An unexpected error occurred';
  }

  /**
   * Get the HTTP status code for this error
   */
  public getHttpStatus(): number {
    const statusMap: Partial<Partial<Record<ErrorCode, number>>> = {
      [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
      [ErrorCode.AUTH_USER_NOT_FOUND]: 404,
      [ErrorCode.AUTH_EMAIL_EXISTS]: 409,
      [ErrorCode.AUTH_WEAK_PASSWORD]: 400,
      [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
      [ErrorCode.AUTH_UNAUTHORIZED]: 401,
      [ErrorCode.AUTH_TOKEN_INVALID]: 401,
      [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
      [ErrorCode.DB_CONNECTION_ERROR]: 503,
      [ErrorCode.DB_QUERY_ERROR]: 500,
      [ErrorCode.DB_RECORD_NOT_FOUND]: 404,
      [ErrorCode.DB_DUPLICATE_RECORD]: 409,
      [ErrorCode.DB_PERMISSION_DENIED]: 403,
      [ErrorCode.DB_CONSTRAINT_VIOLATION]: 409,
      [ErrorCode.STORAGE_UPLOAD_ERROR]: 500,
      [ErrorCode.STORAGE_DOWNLOAD_ERROR]: 500,
      [ErrorCode.STORAGE_FILE_NOT_FOUND]: 404,
      [ErrorCode.STORAGE_PERMISSION_DENIED]: 403,
      [ErrorCode.NETWORK_OFFLINE]: 503,
      [ErrorCode.NETWORK_TIMEOUT]: 504,
      [ErrorCode.NETWORK_UNKNOWN]: 500,
      [ErrorCode.VALIDATION_INVALID_EMAIL]: 400,
      [ErrorCode.VALIDATION_INVALID_PASSWORD]: 400,
      [ErrorCode.VALIDATION_INVALID_USERNAME]: 400,
      [ErrorCode.VALIDATION_INVALID_GAMER_TAG]: 400,
      [ErrorCode.VALIDATION_REQUIRED_FIELD]: 400,
      [ErrorCode.VALIDATION_INVALID_LENGTH]: 400,
      [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
      [ErrorCode.SQUAD_ALREADY_MEMBER]: 409,
      [ErrorCode.SQUAD_FULL]: 409,
      [ErrorCode.SQUAD_NOT_FOUND]: 404,
      [ErrorCode.SQUAD_INVITE_ONLY]: 403,
      [ErrorCode.SQUAD_ALREADY_LEADER]: 409,
      [ErrorCode.SQUAD_CANNOT_KICK_LEADER]: 403,
      [ErrorCode.POST_NOT_FOUND]: 404,
      [ErrorCode.POST_ALREADY_LIKED]: 409,
      [ErrorCode.POST_ALREADY_SAVED]: 409,
      [ErrorCode.COMMENT_NOT_FOUND]: 404,
      [ErrorCode.UNKNOWN_ERROR]: 500,
      [ErrorCode.BAD_REQUEST]: 400,
      [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
    };

    return statusMap[this.code] || this.statusCode || 500;
  }

  /**
   * Convert to JSON for logging
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
      statusCode: this.statusCode,
      stack: this.stack,
    };
  }

  /**
   * Convert to a plain object for sending to the client
   */
  public toClient(): Record<string, any> {
    return {
      code: this.code,
      message: this.userMessage || this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    return `[${this.code}] ${this.message} (${this.severity})`;
  }
}

// ============================================
// 3. ERROR FACTORY FUNCTIONS
// ============================================

/**
 * Create an authentication error
 */
export const createAuthError = (
  code: ErrorCode,
  details?: Record<string, any>,
  statusCode: number = 401
): KonexError => {
  const message = ErrorMessages[code] || 'Authentication error';
  return new KonexError(
    code,
    message,
    message,
    ErrorSeverity.WARNING,
    details,
    true,
    statusCode
  );
};

/**
 * Create a validation error
 */
export const createValidationError = (
  field: string,
  message: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.VALIDATION_REQUIRED_FIELD,
    `Validation failed for ${field}: ${message}`,
    message,
    ErrorSeverity.WARNING,
    { field, ...details },
    true,
    400
  );
};

/**
 * Create a database error
 */
export const createDatabaseError = (
  code: ErrorCode,
  details?: Record<string, any>,
  statusCode: number = 500
): KonexError => {
  const message = ErrorMessages[code] || 'Database error';
  return new KonexError(
    code,
    message,
    message,
    ErrorSeverity.ERROR,
    details,
    true,
    statusCode
  );
};

/**
 * Create a network error
 */
export const createNetworkError = (
  details?: Record<string, any>,
  statusCode: number = 503
): KonexError => {
  const message = ErrorMessages[ErrorCode.NETWORK_OFFLINE];
  return new KonexError(
    ErrorCode.NETWORK_OFFLINE,
    message,
    message,
    ErrorSeverity.ERROR,
    details,
    true,
    statusCode
  );
};

/**
 * Create a not found error
 */
export const createNotFoundError = (
  resource: string,
  id: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.DB_RECORD_NOT_FOUND,
    `${resource} with id ${id} not found`,
    `The ${resource.toLowerCase()} you are looking for could not be found.`,
    ErrorSeverity.WARNING,
    { resource, id, ...details },
    true,
    404
  );
};

/**
 * Create a permission denied error
 */
export const createPermissionDeniedError = (
  resource: string,
  action: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.DB_PERMISSION_DENIED,
    `Permission denied to ${action} ${resource}`,
    `You do not have permission to ${action} this ${resource.toLowerCase()}.`,
    ErrorSeverity.WARNING,
    { resource, action, ...details },
    true,
    403
  );
};

/**
 * Create a duplicate record error
 */
export const createDuplicateError = (
  resource: string,
  details?: Record<string, any>
): KonexError => {
  const message = ErrorMessages[ErrorCode.DB_DUPLICATE_RECORD];
  return new KonexError(
    ErrorCode.DB_DUPLICATE_RECORD,
    `${resource} already exists`,
    message,
    ErrorSeverity.WARNING,
    { resource, ...details },
    true,
    409
  );
};

/**
 * Create a squad full error
 */
export const createSquadFullError = (
  squadId: string,
  maxMembers: number,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.SQUAD_FULL,
    `Squad ${squadId} is full (${maxMembers} members)`,
    'This squad is full. Please try joining another squad.',
    ErrorSeverity.WARNING,
    { squadId, maxMembers, ...details },
    true,
    409
  );
};

/**
 * Create a squad invite only error
 */
export const createSquadInviteOnlyError = (
  squadId: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.SQUAD_INVITE_ONLY,
    `Squad ${squadId} is invite-only`,
    'This squad is invite-only. You must be invited to join.',
    ErrorSeverity.WARNING,
    { squadId, ...details },
    true,
    403
  );
};

/**
 * Create a post not found error
 */
export const createPostNotFoundError = (
  postId: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.POST_NOT_FOUND,
    `Post ${postId} not found`,
    'The post you are looking for could not be found.',
    ErrorSeverity.WARNING,
    { postId, ...details },
    true,
    404
  );
};

/**
 * Create a comment not found error
 */
export const createCommentNotFoundError = (
  commentId: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.COMMENT_NOT_FOUND,
    `Comment ${commentId} not found`,
    'The comment you are looking for could not be found.',
    ErrorSeverity.WARNING,
    { commentId, ...details },
    true,
    404
  );
};

/**
 * Create a squad already member error
 */
export const createSquadAlreadyMemberError = (
  userId: string,
  squadId: string,
  details?: Record<string, any>
): KonexError => {
  return new KonexError(
    ErrorCode.SQUAD_ALREADY_MEMBER,
    `User ${userId} is already a member of squad ${squadId}`,
    'You are already a member of this squad.',
    ErrorSeverity.WARNING,
    { userId, squadId, ...details },
    true,
    409
  );
};

// ============================================
// 4. EXPORT DEFAULT
// ============================================

export default KonexError;

// Re-export common enums for convenience and to avoid import mistakes elsewhere
export { ErrorCode, ErrorSeverity } from './error.codes';
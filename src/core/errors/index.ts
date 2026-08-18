/**
 * KONEX Errors - Main Export
 * Billion Dollar Code - Production Ready
 */

// Export app.error
export {
    createAuthError, createCommentNotFoundError, createDatabaseError, createDuplicateError, createNetworkError,
    createNotFoundError,
    createPermissionDeniedError, createPostNotFoundError, createSquadAlreadyMemberError, createSquadFullError,
    createSquadInviteOnlyError, createValidationError, KonexError, default as KonexErrorDefault
} from './app.error';

// Export error.codes
export {
    ErrorCategories, ErrorCode, default as ErrorCodeDefault, ErrorMessages, ErrorSeverity, ErrorSeverityMap
} from './error.codes';

// Export error.handler
export {
    addErrorListener, errorHandler, default as errorHandlerDefault, getErrorStats, handleError, handleFatalError, handleRecoverableError, removeErrorListener, resetErrorHandler, updateErrorHandler
} from './error.handler';

// Export error.messages
export {
    getUserErrorMessage,
    getUserMessageFromError,
    LocalizedErrorMessages, UserErrorMessages, default as UserErrorMessagesDefault
} from './error.messages';

// ============================================
// 2. TYPES
// ============================================

export type {
    ErrorContext, ErrorHandlerConfig, ErrorResult
} from './error.handler';

export type {
    ErrorMessageLocalization
} from './error.messages';

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default {
  KonexError,
  ErrorCode,
  ErrorSeverity,
  errorHandler,
  handleError,
  getUserErrorMessage,
  getUserMessageFromError,
};
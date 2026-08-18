/**
 * KONEX Core - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * This file exports all core functionality including:
 * - Error handling (KonexError, ErrorCode, ErrorSeverity, errorHandler)
 * - Logger (logger, log levels, transports)
 * - Validation (validation utilities, validators)
 * 
 * Usage:
 * import { KonexError, ErrorCode, logger, validateEmail } from '@core';
 */

// ============================================
// 1. EXPORT ERRORS
// ============================================

export {

    // Error factory functions
    createAuthError, createCommentNotFoundError, createDatabaseError, createDuplicateError, createNetworkError,
    createNotFoundError,
    createPermissionDeniedError, createPostNotFoundError, createSquadAlreadyMemberError, createSquadFullError,
    createSquadInviteOnlyError, createValidationError,
    // Main error class
    KonexError,
    // Default export
    default as KonexErrorDefault
} from './errors/app.error';

export {

    // Error categories
    ErrorCategories,
    // Error codes and severity
    ErrorCode,
    // Default export
    default as ErrorCodeDefault,
    // Error messages
    ErrorMessages, ErrorSeverity,
    // Error severity mapping
    ErrorSeverityMap
} from './errors/error.codes';

export {
    addErrorListener,
    // Error handler singleton
    errorHandler,
    // Default export
    default as errorHandlerDefault, getErrorStats,
    // Error handler functions
    handleError, handleFatalError, handleRecoverableError, removeErrorListener, resetErrorHandler, updateErrorHandler
} from './errors/error.handler';

export {

    // Error message utilities
    getUserErrorMessage,
    getUserMessageFromError,

    // Localization support
    LocalizedErrorMessages,
    // User-friendly error messages
    UserErrorMessages,
    // Default export
    default as UserErrorMessagesDefault
} from './errors/error.messages';

// ============================================
// 2. EXPORT LOGGER
// ============================================

export {
    clearMetadata,

    // Flush utility
    flushLogs,
    // Logging functions
    logDebug, logError,
    logFatal,
    // Logger singleton
    logger,
    // Default export
    default as loggerDefault, logInfo,
    // Performance utilities
    logPerformance, logWarn, measurePerformance, popContext,
    // Context management
    pushContext, setMetadata, startTimer
} from './logger/logger.service';

export {
    ILogger,
    // Types
    LogContext, LogFileInfo, LoggerConfig,
    // Default export
    default as loggerTypesDefault,
    // Log levels
    LogLevel, LogMetadata, LogTransport, PerformanceMetric,
    PerformanceMetrics, RemoteConfig
} from './logger/logger.types';

export {
    // Logger transports
    ConsoleTransport, FileTransport, PerformanceTransport, RemoteTransport, SentryTransport
} from './logger/transports';

// ============================================
// 3. EXPORT VALIDATORS
// ============================================

// Validation utilities
export {
    validateBio,
    // Core validation functions
    validateEmail, validateGamerTag, validateLength, validateLoginInput, validatePassword, validatePhone, validateProfileUpdateInput, validateRegex, validateRequired,
    // Combined validators
    validateSignUpInput, validateUrl, validateUsername,
    // Default export
    default as validationUtilsDefault
} from './utils/validators/validation.utils';

// Auth validators
export {
    AuthValidator, default as AuthValidatorDefault, validateEmail as validateAuthEmail, validateGamerTag as validateAuthGamerTag, validatePassword as validateAuthPassword,
    validateUsername as validateAuthUsername
} from './utils/validators/auth.validator';

// User validators
export {
    UserValidator, default as UserValidatorDefault, validateUserProfile,
    validateUserSettings
} from './utils/validators/user.validator';

// Post validators
export {
    PostValidator, default as PostValidatorDefault, validatePostContent,
    validatePostType
} from './utils/validators/post.validator';

// Squad validators
export {
    SquadValidator, default as SquadValidatorDefault, validateSquadDescription, validateSquadName,
    validateSquadTag
} from './utils/validators/squad.validator';

// ============================================
// 4. EXPORT TYPES
// ============================================

export type {

    // Auth validator types
    AuthValidatorInput,
    AuthValidatorOutput, ErrorContext,
    // Error types
    ErrorHandlerConfig, ErrorMessageLocalization, ErrorResult, ILogger as ILoggerType,
    // Logger types
    LogContext as LogContextType, LogFileInfo as LogFileInfoType, LoggerConfig as LoggerConfigType, LogMetadata as LogMetadataType, LogTransport as LogTransportType, PerformanceMetrics as PerformanceMetricsType, PerformanceMetric as PerformanceMetricType,
    // Post validator types
    PostValidatorInput,
    PostValidatorOutput, RemoteConfig as RemoteConfigType,
    // Squad validator types
    SquadValidatorInput,
    SquadValidatorOutput,
    // User validator types
    UserValidatorInput,
    UserValidatorOutput, ValidationError,
    // Validator types
    ValidationResult
} from './types';

// ============================================
// 5. CORE CONFIGURATION
// ============================================

export const CORE_CONFIG = {
  version: '1.0.0',
  name: 'KONEX Core',
  errors: {
    enabled: true,
    captureStackTraces: true,
  },
  logger: {
    defaultLevel: LogLevel.INFO,
    maxBufferSize: 100,
    flushInterval: 5000,
  },
  validators: {
    strictMode: true,
    trimStrings: true,
  },
} as const;

// ============================================
// 6. CORE INITIALIZATION
// ============================================

/**
 * Initialize the core module
 * This should be called once at app startup
 */
export const initializeCore = (config?: {
  errorHandler?: Partial<ErrorHandlerConfig>;
  logger?: Partial<LoggerConfig>;
}) => {
  // Update error handler configuration
  if (config?.errorHandler) {
    updateErrorHandler(config.errorHandler);
  }

  // Update logger configuration
  if (config?.logger) {
    logger.updateConfig(config.logger);
  }

  // Log initialization
  logger.info('🚀 KONEX Core initialized', {
    config: CORE_CONFIG,
    environment: process.env.NODE_ENV || 'development',
  });

  return {
    success: true,
    config: CORE_CONFIG,
  };
};

/**
 * Get core status
 */
export const getCoreStatus = () => {
  return {
    config: CORE_CONFIG,
    errorHandler: errorHandler.getErrorStats(),
    logger: logger.getConfig(),
    validators: {
      strictMode: CORE_CONFIG.validators.strictMode,
      trimStrings: CORE_CONFIG.validators.trimStrings,
    },
    initialized: true,
  };
};

/**
 * Reset core to default state
 */
export const resetCore = () => {
  errorHandler.reset();
  logger.clearBuffer();
  logger.clearMetadata();
  return {
    success: true,
    message: 'Core reset successfully',
  };
};

// ============================================
// 7. DEFAULT EXPORT
// ============================================

export default {
  // Errors
  KonexError,
  ErrorCode,
  ErrorSeverity,
  errorHandler,
  handleError,
  getUserErrorMessage,
  getUserMessageFromError,

  // Logger
  logger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logFatal,
  LogLevel,

  // Validators
  validateEmail,
  validatePassword,
  validateUsername,
  validateGamerTag,
  validateBio,
  validateUrl,
  validatePhone,
  validateLength,
  validateRequired,
  validateRegex,

  // Auth Validators
  AuthValidator,

  // User Validators
  UserValidator,

  // Post Validators
  PostValidator,

  // Squad Validators
  SquadValidator,

  // Core Utilities
  initializeCore,
  getCoreStatus,
  resetCore,
  CORE_CONFIG,
};
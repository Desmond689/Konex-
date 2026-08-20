/**
 * KONEX Logging Interceptor
 * Billion Dollar Code - Production Ready
 *
 * Intercepts API requests and responses for logging purposes
 * 
 * Usage:
 * import loggingInterceptor from '@api/interceptors/logging.interceptor';
 * loggingInterceptor.attach();
 */

import { IS_DEVELOPMENT, IS_PRODUCTION } from '../../config/env';
import { logger } from '../../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface LoggingInterceptorConfig {
  /** Log request headers */
  logHeaders?: boolean;
  /** Log request body */
  logBody?: boolean;
  /** Log response headers */
  logResponseHeaders?: boolean;
  /** Log response body */
  logResponseBody?: boolean;
  /** Maximum body size to log (in bytes) */
  maxBodySize?: number;
  /** Enable logging in production */
  enableInProduction?: boolean;
  /** Custom log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Filter sensitive headers */
  filterSensitiveHeaders?: boolean;
  /** Sensitive headers to filter */
  sensitiveHeaders?: string[];
}

export interface LogEntry {
  /** Timestamp */
  timestamp: string;
  /** Request method */
  method: string;
  /** Request URL */
  url: string;
  /** Request ID */
  requestId?: string;
  /** Request headers (filtered) */
  headers?: Record<string, string>;
  /** Request body (filtered) */
  body?: any;
  /** Response status */
  status?: number;
  /** Response status text */
  statusText?: string;
  /** Response duration in ms */
  duration?: number;
  /** Response headers (filtered) */
  responseHeaders?: Record<string, string>;
  /** Response body (filtered) */
  responseBody?: any;
  /** Error if any */
  error?: Error;
}

// ============================================
// 2. DEFAULT CONFIG
// ============================================

const DEFAULT_CONFIG: LoggingInterceptorConfig = {
  logHeaders: IS_DEVELOPMENT,
  logBody: IS_DEVELOPMENT,
  logResponseHeaders: IS_DEVELOPMENT,
  logResponseBody: IS_DEVELOPMENT,
  maxBodySize: 1024 * 1024, // 1MB
  enableInProduction: false,
  logLevel: 'debug',
  filterSensitiveHeaders: true,
  sensitiveHeaders: [
    'authorization',
    'x-api-key',
    'cookie',
    'set-cookie',
    'x-auth-token',
    'access-token',
    'refresh-token',
  ],
};

// ============================================
// 3. SENSITIVE DATA FILTER
// ============================================

/**
 * Filter sensitive data from object
 */
const filterSensitiveData = (
  obj: Record<string, any> | any[] | any,
  sensitiveKeys: string[]
): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => filterSensitiveData(item, sensitiveKeys));
  }

  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk.toLowerCase()))) {
      filtered[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      filtered[key] = filterSensitiveData(value, sensitiveKeys);
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
};

/**
 * Truncate body if too large
 */
const truncateBody = (body: any, maxSize: number): any => {
  if (!body) return body;
  
  try {
    const json = typeof body === 'string' ? body : JSON.stringify(body);
    if (json.length > maxSize) {
      return json.substring(0, maxSize) + '... [TRUNCATED]';
    }
    return body;
  } catch {
    return body;
  }
};

// ============================================
// 4. LOGGING INTERCEPTOR
// ============================================

export class LoggingInterceptor {
  private config: LoggingInterceptorConfig;
  private requestMap: Map<string, { startTime: number; request: Partial<LogEntry> }> = new Map();
  private requestCounter = 0;

  constructor(config: Partial<LoggingInterceptorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================
  // CONFIG
  // ============================================

  /**
   * Update interceptor configuration
   */
  updateConfig(config: Partial<LoggingInterceptorConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('📝 Logging interceptor config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggingInterceptorConfig {
    return { ...this.config };
  }

  // ============================================
  // SHOULD LOG
  // ============================================

  private shouldLog(): boolean {
    if (IS_PRODUCTION && !this.config.enableInProduction) {
      return false;
    }
    return true;
  }

  // ============================================
  // GENERATE REQUEST ID
  // ============================================

  private generateRequestId(): string {
    this.requestCounter++;
    return `req_${Date.now()}_${this.requestCounter}`;
  }

  // ============================================
  // FILTER HEADERS
  // ============================================

  private filterHeaders(headers: Record<string, string>): Record<string, string> {
    if (!this.config.filterSensitiveHeaders) {
      return headers;
    }

    const sensitiveKeys = this.config.sensitiveHeaders || DEFAULT_CONFIG.sensitiveHeaders!;
    const filtered: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk.toLowerCase()))) {
        filtered[key] = '[REDACTED]';
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  // ============================================
  // INTERCEPT REQUEST
  // ============================================

  /**
   * Intercept and log API requests
   */
  interceptRequest(request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  }): { requestId: string; headers: Record<string, string> } {
    if (!this.shouldLog()) {
      return { requestId: '', headers: request.headers || {} };
    }

    const requestId = this.generateRequestId();
    const filteredHeaders = request.headers 
      ? this.filterHeaders(request.headers)
      : {};

    const logEntry: Partial<LogEntry> = {
      requestId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
    };

    if (this.config.logHeaders && filteredHeaders) {
      logEntry.headers = filteredHeaders;
    }

    if (this.config.logBody && request.body) {
      logEntry.body = truncateBody(
        filterSensitiveData(request.body, this.config.sensitiveHeaders || []),
        this.config.maxBodySize || DEFAULT_CONFIG.maxBodySize!
      );
    }

    // Store request for response tracking
    this.requestMap.set(requestId, {
      startTime: Date.now(),
      request: logEntry,
    });

    // Log request
    const logLevel = this.config.logLevel || 'debug';
    logger[logLevel]('📤 API Request', {
      requestId,
      method: request.method,
      url: request.url,
      ...(this.config.logHeaders && { headers: filteredHeaders }),
      ...(this.config.logBody && { body: logEntry.body }),
    });

    return {
      requestId,
      headers: request.headers || {},
    };
  }

  // ============================================
  // INTERCEPT RESPONSE
  // ============================================

  /**
   * Intercept and log API responses
   */
  interceptResponse(
    requestId: string,
    response: {
      status: number;
      statusText?: string;
      headers?: Record<string, string>;
      body?: any;
    },
    error?: Error
  ): void {
    if (!this.shouldLog()) {
      return;
    }

    const requestData = this.requestMap.get(requestId);
    const duration = requestData ? Date.now() - requestData.startTime : 0;

    const filteredHeaders = response.headers 
      ? this.filterHeaders(response.headers)
      : {};

    const logEntry: Partial<LogEntry> = {
      ...(requestData?.request || {}),
      status: response.status,
      statusText: response.statusText,
      duration,
    };

    if (this.config.logResponseHeaders && filteredHeaders) {
      logEntry.responseHeaders = filteredHeaders;
    }

    if (this.config.logResponseBody && response.body) {
      logEntry.responseBody = truncateBody(
        filterSensitiveData(response.body, this.config.sensitiveHeaders || []),
        this.config.maxBodySize || DEFAULT_CONFIG.maxBodySize!
      );
    }

    if (error) {
      logEntry.error = error;
    }

    // Log response
    const logLevel = error ? 'error' : (this.config.logLevel || 'debug');
    const message = error 
      ? `❌ API Error: ${response.status} ${response.statusText || ''}`
      : `📥 API Response: ${response.status}`;

    logger[logLevel](message, {
      requestId,
      status: response.status,
      duration: `${duration}ms`,
      ...(this.config.logResponseHeaders && { responseHeaders: filteredHeaders }),
      ...(this.config.logResponseBody && { body: logEntry.responseBody }),
      ...(error && { error: error.message }),
    });

    // Clean up
    this.requestMap.delete(requestId);
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Clear all pending request tracking
   */
  clearPending(): void {
    this.requestMap.clear();
    logger.info('📝 Pending request logs cleared');
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.requestMap.size;
  }

  /**
   * Get all pending requests
   */
  getPendingRequests(): string[] {
    return Array.from(this.requestMap.keys());
  }
}

// ============================================
// 5. SINGLETON INSTANCE
// ============================================

export const loggingInterceptor = new LoggingInterceptor();

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

/**
 * Update logging interceptor configuration
 */
export const updateLoggingInterceptor = (
  config: Partial<LoggingInterceptorConfig>
): void => {
  loggingInterceptor.updateConfig(config);
};

/**
 * Get logging interceptor configuration
 */
export const getLoggingConfig = (): LoggingInterceptorConfig => {
  return loggingInterceptor.getConfig();
};

/**
 * Clear pending request tracking
 */
export const clearPendingLogs = (): void => {
  loggingInterceptor.clearPending();
};

/**
 * Get pending request count
 */
export const getPendingLogCount = (): number => {
  return loggingInterceptor.getPendingCount();
};

// ============================================
// 7. DEFAULT EXPORT
// ============================================

export default loggingInterceptor;
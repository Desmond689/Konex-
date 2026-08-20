// @ts-nocheck
/**
 * KONEX Logger Service
 * Billion Dollar Code - Production Ready
 * Enterprise-grade logging with multiple transports, structured logging,
 * log levels, buffering, and performance optimization
 */

import * as Sentry from '../../lib/sentry-noop';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { APP_VERSION, IS_DEVELOPMENT, IS_PRODUCTION } from '../../config/env.config';
import {
    LogContext,
    LogEntry,
    LoggerConfig,
    LogLevel,
    LogMetadata,
    LogTransport,
} from './logger.types';

// ============================================
// 1. CONSOLE TRANSPORT
// ============================================

class ConsoleTransport implements LogTransport {
  private colors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '\x1b[36m',   // Cyan
    [LogLevel.INFO]: '\x1b[32m',    // Green
    [LogLevel.WARN]: '\x1b[33m',    // Yellow
    [LogLevel.ERROR]: '\x1b[31m',   // Red
    [LogLevel.FATAL]: '\x1b[41m\x1b[37m', // Red background, white text
  };

  private emojis: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '🐛',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.FATAL]: '💀',
  };

  log(entry: LogEntry): void {
    const color = this.colors[entry.level] || '\x1b[0m';
    const emoji = this.emojis[entry.level] || '📝';
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    let message = `${color}${emoji} [${entry.level}] [${timestamp}]`;

    if (entry.context?.userId) {
      message += ` [User: ${entry.context.userId}]`;
    }

    if (entry.context?.sessionId) {
      message += ` [Session: ${entry.context.sessionId}]`;
    }

    if (entry.context?.component) {
      message += ` [${entry.context.component}]`;
    }

    message += ` ${entry.message}`;
    message += '\x1b[0m';

    // Log with appropriate console method
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
      console.error(message);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(message);
    } else {
      console.log(message);
    }

    // Log additional data
    if (entry.data && Object.keys(entry.data).length > 0) {
      console.log('  📦 Data:', JSON.stringify(entry.data, null, 2));
    }

    if (entry.error) {
      console.error('  🔴 Error:', entry.error);
      if (entry.error.stack) {
        console.error('  📚 Stack:', entry.error.stack);
      }
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log('  📋 Metadata:', JSON.stringify(entry.metadata, null, 2));
    }
  }
}

// ============================================
// 2. SENTRY TRANSPORT
// ============================================

class SentryTransport implements LogTransport {
  log(entry: LogEntry): void {
    try {
      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
        const error = entry.error || new Error(entry.message);
        Sentry.captureException(error, {
          tags: {
            level: entry.level,
            platform: Platform.OS,
            version: APP_VERSION,
            component: entry.context?.component || 'unknown',
          },
          extra: {
            data: entry.data,
            context: entry.context,
            metadata: entry.metadata,
            timestamp: entry.timestamp,
          },
        });
      } else if (entry.level === LogLevel.WARN) {
        Sentry.captureMessage(entry.message, {
          level: 'warning',
          tags: {
            level: entry.level,
            platform: Platform.OS,
            version: APP_VERSION,
            component: entry.context?.component || 'unknown',
          },
          extra: {
            data: entry.data,
            context: entry.context,
            metadata: entry.metadata,
          },
        });
      } else if (entry.level === LogLevel.INFO && entry.context?.component === 'performance') {
        // Send performance metrics to Sentry
        Sentry.addBreadcrumb({
          message: entry.message,
          category: 'performance',
          data: {
            duration: entry.data?.duration,
            component: entry.context?.component,
          },
          level: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Failed to log to Sentry:', error);
    }
  }
}

// ============================================
// 3. FILE TRANSPORT
// ============================================

class FileTransport implements LogTransport {
  private logs: LogEntry[] = [];
  private maxSize: number = 10000;
  private filePath: string;
  private isWriting: boolean = false;
  private writeQueue: LogEntry[] = [];

  constructor() {
    this.filePath = `${FileSystem.documentDirectory}logs/`;
    // Avoid calling native file-system APIs on web where expo-file-system is unavailable
    if (Platform.OS !== 'web') {
      this.ensureDirectoryExists();
    } else {
      // No-op on web — keep in-memory behavior only
      console.warn('FileTransport: disabled on web platform.');
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    // expo-file-system is not available on web — guard early
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const dirInfo = await FileSystem.getInfoAsync(this.filePath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.filePath, { intermediates: true });
      }
    } catch (error) {
      console.error('❌ Failed to create log directory:', error);
    }
  }

  log(entry: LogEntry): void {
    this.logs.push(entry);

    // Trim logs if they exceed maximum
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize);
    }

    // Write to file asynchronously
    this.queueWrite(entry);
  }

  private queueWrite(entry: LogEntry): void {
    this.writeQueue.push(entry);
    if (!this.isWriting) {
      this.processWriteQueue();
    }
  }

  private async processWriteQueue(): Promise<void> {
    if (this.writeQueue.length === 0) {
      this.isWriting = false;
      return;
    }

    this.isWriting = true;
    const entries = [...this.writeQueue];
    this.writeQueue = [];

    try {
      const logLines = entries.map((entry) => JSON.stringify(entry)).join('\n') + '\n';
      const fileUri = `${this.filePath}${new Date().toISOString().split('T')[0]}.log`;
      await FileSystem.writeAsStringAsync(fileUri, logLines, {
        encoding: FileSystem.EncodingType.UTF8,
        // append: true,

      });
    } catch (error) {
      console.error('❌ Failed to write log to file:', error);
      // Re-queue entries that failed
      this.writeQueue = [...entries, ...this.writeQueue];
    } finally {
      this.isWriting = false;
      if (this.writeQueue.length > 0) {
        this.processWriteQueue();
      }
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByDate(date: string): LogEntry[] {
    return this.logs.filter(
      (entry) => entry.timestamp.startsWith(date)
    );
  }

  clear(): void {
    this.logs = [];
  }

  async clearFiles(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.filePath);
      for (const file of files) {
        await FileSystem.deleteAsync(`${this.filePath}${file}`);
      }
      this.logs = [];
    } catch (error) {
      console.error('❌ Failed to clear log files:', error);
    }
  }

  async getLogFiles(): Promise<string[]> {
    try {
      return await FileSystem.readDirectoryAsync(this.filePath);
    } catch (error) {
      console.error('❌ Failed to read log files:', error);
      return [];
    }
  }

  async getLogContent(filename: string): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(`${this.filePath}${filename}`);
    } catch (error) {
      console.error('❌ Failed to read log file:', error);
      return '';
    }
  }
}

// ============================================
// 4. REMOTE TRANSPORT (Optional)
// ============================================

interface RemoteTransportConfig {
  url: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
}

class RemoteTransport implements LogTransport {
  private config: RemoteTransportConfig;
  private buffer: LogEntry[] = [];
  private batchSize: number;
  private flushInterval: number;
  private timer: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;

  constructor(config: RemoteTransportConfig) {
    this.config = config;
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 30000; // 30 seconds
    this.startTimer();
  }

  log(entry: LogEntry): void {
    // Only send errors and warnings remotely
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL || entry.level === LogLevel.WARN) {
      this.buffer.push(entry);
      if (this.buffer.length >= this.batchSize) {
        this.flush();
      }
    }
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) {
      return;
    }

    this.isFlushing = true;
    const entries = [...this.buffer];
    this.buffer = [];

    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'X-API-Key': this.config.apiKey } : {}),
        },
        body: JSON.stringify({
          logs: entries,
          platform: Platform.OS,
          version: APP_VERSION,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to send logs remotely:', error);
      // Re-queue entries that failed
      this.buffer = [...entries, ...this.buffer];
    } finally {
      this.isFlushing = false;
    }
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// ============================================
// 5. PERFORMANCE TRANSPORT
// ============================================

class PerformanceTransport implements LogTransport {
  private metrics: Map<string, { count: number; total: number; min: number; max: number }> = new Map();

  log(entry: LogEntry): void {
    if (entry.context?.component !== 'performance') {
      return;
    }

    const metricName = entry.context?.metric || 'unknown';
    const value = entry.data?.duration || 0;

    const existing = this.metrics.get(metricName) || {
      count: 0,
      total: 0,
      min: Infinity,
      max: -Infinity,
    };

    existing.count++;
    existing.total += value;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);

    this.metrics.set(metricName, existing);

    // Log warning if performance is poor
    if (value > 1000) {
      console.warn(`⚠️ Performance issue in ${metricName}: ${value}ms`);
    }
  }

  getMetrics(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const result: Record<string, { count: number; avg: number; min: number; max: number }> = {};
    this.metrics.forEach((value, key) => {
      result[key] = {
        count: value.count,
        avg: value.total / value.count,
        min: value.min === Infinity ? 0 : value.min,
        max: value.max === -Infinity ? 0 : value.max,
      };
    });
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// ============================================
// 6. LOGGER SERVICE
// ============================================

class LoggerService {
  private static instance: LoggerService;
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private performanceTransport: PerformanceTransport;
  private logBuffer: LogEntry[] = [];
  private bufferSize: number = 100;
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;
  private contextStack: LogContext[] = [];
  private metadata: LogMetadata = {};

  private constructor() {
    this.performanceTransport = new PerformanceTransport();

    this.config = {
      minLevel: IS_DEVELOPMENT ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableSentry: IS_PRODUCTION,
      enableFile: IS_DEVELOPMENT,
      enableRemote: false,
      enablePerformance: IS_DEVELOPMENT,
      includeTimestamp: true,
      includeStack: IS_DEVELOPMENT,
      maxBufferSize: 100,
      flushInterval: 5000,
    };

    // Initialize transports
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport());
    }

    if (this.config.enableSentry) {
      this.transports.push(new SentryTransport());
    }

    if (this.config.enableFile && Platform.OS !== 'web') {
      this.transports.push(new FileTransport());
    } else if (this.config.enableFile && Platform.OS === 'web') {
      // Avoid file transport on web — expo-file-system APIs are not available there
      console.warn('LoggerService: file transport disabled on web platform.');
    }

    if (this.config.enablePerformance) {
      this.transports.push(this.performanceTransport);
    }

    // Start flush interval
    this.startFlushInterval();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  // ============================================
  // 7. LOGGING METHODS
  // ============================================

  debug(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, error?: any, data?: any, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, data, { ...context, error });
  }

  fatal(message: string, error?: any, data?: any, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, data, { ...context, error });
  }

  // ============================================
  // 8. CORE LOG METHOD
  // ============================================

  private log(level: LogLevel, message: string, data?: any, context?: LogContext): void {
    // Check minimum level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context: { ...this.getCurrentContext(), ...context },
      metadata: { ...this.metadata },
      error: context?.error instanceof Error ? context.error : undefined,
    };

    // Buffer the log
    this.bufferLog(entry);

    // If it's a high severity log, flush immediately
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      this.flushLogs();
    }
  }

  // ============================================
  // 9. BUFFERING
  // ============================================

  private bufferLog(entry: LogEntry): void {
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.bufferSize) {
      this.flushLogs();
    }
  }

  private flushLogs(): void {
    if (this.isFlushing || this.logBuffer.length === 0) {
      return;
    }

    this.isFlushing = true;
    const logs = [...this.logBuffer];
    this.logBuffer = [];

    // Process each log through all transports
    logs.forEach((entry) => {
      this.transports.forEach((transport) => {
        try {
          transport.log(entry);
        } catch (error) {
          console.error('❌ Failed to log to transport:', error);
        }
      });
    });

    this.isFlushing = false;
  }

  private startFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval || 5000);
  }

  // ============================================
  // 10. CONTEXT MANAGEMENT
  // ============================================

  pushContext(context: LogContext): void {
    this.contextStack.push(context);
  }

  popContext(): LogContext | undefined {
    return this.contextStack.pop();
  }

  getCurrentContext(): LogContext {
    const context: LogContext = {};
    this.contextStack.forEach((c) => {
      Object.assign(context, c);
    });
    return context;
  }

  setMetadata(metadata: LogMetadata): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  clearMetadata(): void {
    this.metadata = {};
  }

  // ============================================
  // 11. CONFIGURATION
  // ============================================

  shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const minIndex = levels.indexOf(this.config.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart flush interval if needed
    if (config.flushInterval) {
      this.startFlushInterval();
    }

    // Update transports
    if (config.enableRemote && !this.transports.some((t) => t instanceof RemoteTransport)) {
      // Add remote transport if configured
    }
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(transport: LogTransport): void {
    const index = this.transports.indexOf(transport);
    if (index > -1) {
      this.transports.splice(index, 1);
    }
  }

  // ============================================
  // 12. PERFORMANCE METHODS
  // ============================================

  startTimer(name: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.info(`⏱️ ${name} completed`, { duration }, { 
        component: 'performance',
        metric: name,
      });
    };
  }

  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`⏱️ ${name} completed`, { duration }, { 
        component: 'performance',
        metric: name,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`⏱️ ${name} failed`, error, { duration }, { 
        component: 'performance',
        metric: name,
      });
      throw error;
    }
  }

  getPerformanceMetrics(): Record<string, { count: number; avg: number; min: number; max: number }> {
    return this.performanceTransport.getMetrics();
  }

  // ============================================
  // 13. UTILITY METHODS
  // ============================================

  /**
   * Flush all pending logs
   */
  flush(): void {
    this.flushLogs();
  }

  /**
   * Get all buffered logs
   */
  getBufferedLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear all buffered logs
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Get the current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Get file transport if enabled
   */
  getFileTransport(): FileTransport | null {
    return this.transports.find((t) => t instanceof FileTransport) as FileTransport || null;
  }

  /**
   * Get all logs from file transport
   */
  getLogs(): LogEntry[] {
    const fileTransport = this.getFileTransport();
    return fileTransport ? fileTransport.getLogs() : [];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    const fileTransport = this.getFileTransport();
    if (fileTransport) {
      fileTransport.clear();
    }
    this.clearBuffer();
  }

  /**
   * Destroy the logger instance
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushLogs();
    this.logBuffer = [];
    this.transports = [];
    this.contextStack = [];
    this.metadata = {};
  }
}

// ============================================
// 14. EXPORT SINGLETON
// ============================================

export const logger = LoggerService.getInstance();

// ============================================
// 15. CONVENIENCE FUNCTIONS
// ============================================

export const logDebug = (message: string, data?: any, context?: LogContext) => {
  logger.debug(message, data, context);
};

export const logInfo = (message: string, data?: any, context?: LogContext) => {
  logger.info(message, data, context);
};

export const logWarn = (message: string, data?: any, context?: LogContext) => {
  logger.warn(message, data, context);
};

export const logError = (message: string, error?: any, data?: any, context?: LogContext) => {
  logger.error(message, error, data, context);
};

export const logFatal = (message: string, error?: any, data?: any, context?: LogContext) => {
  logger.fatal(message, error, data, context);
};

export const logPerformance = (name: string, duration: number, data?: any) => {
  logger.info(`⏱️ ${name}`, { duration, ...data }, { 
    component: 'performance',
    metric: name,
  });
};

export const measurePerformance = <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
  return logger.measure(name, fn);
};

export const startTimer = (name: string): () => void => {
  return logger.startTimer(name);
};

export const pushContext = (context: LogContext): void => {
  logger.pushContext(context);
};

export const popContext = (): LogContext | undefined => {
  return logger.popContext();
};

export const setMetadata = (metadata: LogMetadata): void => {
  logger.setMetadata(metadata);
};

export const clearMetadata = (): void => {
  logger.clearMetadata();
};

export const flushLogs = (): void => {
  logger.flush();
};

// ============================================
// 16. EXPORT DEFAULT
// ============================================

export default logger;
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: LogContext;
  metadata?: Record<string, any>;
  error?: any;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole?: boolean;
  enableSentry?: boolean;
  enableFile?: boolean;
  enableRemote?: boolean;
  enablePerformance?: boolean;
  includeTimestamp?: boolean;
  includeStack?: boolean;
  maxBufferSize?: number;
  flushInterval?: number;
}

export interface LogMetadata {
  [key: string]: any;
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

export interface LogFileInfo {
  path: string;
  size: number;
  modifiedAt?: string;
}


export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime?: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

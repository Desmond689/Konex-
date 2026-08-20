/** Safe barrel - no duplicates */

export { logger } from './logger.service';
export { logDebug } from './logger.service';
export { logInfo } from './logger.service';
export { logWarn } from './logger.service';
export { logError } from './logger.service';
export { logFatal } from './logger.service';
export { logPerformance } from './logger.service';
export { measurePerformance } from './logger.service';
export { startTimer } from './logger.service';
export { pushContext } from './logger.service';
export { popContext } from './logger.service';
export { setMetadata } from './logger.service';
export { clearMetadata } from './logger.service';
export { flushLogs } from './logger.service';
export { default as LoggerService } from './logger.service';
export { LogLevel } from './logger.types';
export type { LogContext } from './logger.types';
export type { LogEntry } from './logger.types';
export type { LoggerConfig } from './logger.types';
export type { LogMetadata } from './logger.types';
export type { LogTransport } from './logger.types';
export type { LogFileInfo } from './logger.types';
export type { PerformanceMetrics } from './logger.types';

/**
 * KONEX Remote Transport
 * Billion Dollar Code - Production Ready
 * Sends logs to a remote API for centralized logging
 */

import { Platform } from 'react-native';
import { APP_NAME, APP_VERSION } from '../../../config/env.config';
import { LogEntry, LogLevel, LogTransport } from '../logger.types';

// ============================================
// 1. REMOTE TRANSPORT
// ============================================

export interface RemoteTransportConfig {
  url: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  minLevel?: LogLevel;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  enabled?: boolean;
}

export interface RemoteLogPayload {
  logs: LogEntry[];
  metadata: {
    platform: string;
    version: string;
    app: string;
    timestamp: string;
    environment?: string;
  };
}

export class RemoteTransport implements LogTransport {
  private config: RemoteTransportConfig;
  private buffer: LogEntry[] = [];
  private batchSize: number;
  private flushInterval: number;
  private minLevel: LogLevel;
  private timer: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;
  private retryQueue: LogEntry[] = [];
  private retryAttempts: number = 0;
  private enabled: boolean = true;
  private lastFlushTime: number = 0;

  constructor(config: RemoteTransportConfig) {
    this.config = config;
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 30000; // 30 seconds
    this.minLevel = config.minLevel || LogLevel.ERROR;
    this.enabled = config.enabled !== undefined ? config.enabled : true;

    if (this.enabled) {
      this.startTimer();
    }
  }

  log(entry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    // Check minimum level
    const levels = Object.values(LogLevel);
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(entry.level);
    if (currentIndex < minIndex) {
      return;
    }

    this.buffer.push(entry);

    // Flush if batch size is reached
    if (this.buffer.length >= this.batchSize) {
      this.flush();
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
    if (this.isFlushing) {
      return;
    }

    // Don't flush if buffer is empty and retry queue is empty
    if (this.buffer.length === 0 && this.retryQueue.length === 0) {
      return;
    }

    // Rate limit flushes
    const now = Date.now();
    if (now - this.lastFlushTime < 1000) {
      // Wait at least 1 second between flushes
      setTimeout(() => this.flush(), 1000);
      return;
    }

    this.isFlushing = true;
    this.lastFlushTime = now;

    try {
      // Combine buffer and retry queue
      const entries = [...this.buffer, ...this.retryQueue];
      this.buffer = [];
      this.retryQueue = [];

      await this.sendLogs(entries);
      this.retryAttempts = 0;
    } catch (error) {
      // Retry with exponential backoff
      this.retryQueue = [...entries];
      this.retryAttempts++;

      if (this.retryAttempts < (this.config.retryAttempts || 3)) {
        const delay = (this.config.retryDelay || 1000) * Math.pow(2, this.retryAttempts);
        setTimeout(() => {
          this.flush();
        }, delay);
      } else {
        // Max retries reached, drop the logs
        console.warn('⚠️ Max retry attempts reached, dropping logs');
        this.retryQueue = [];
        this.retryAttempts = 0;
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendLogs(entries: LogEntry[]): Promise<void> {
    const payload: RemoteLogPayload = {
      logs: entries,
      metadata: {
        platform: Platform.OS,
        version: APP_VERSION,
        app: APP_NAME,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
    };

    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'X-API-Key': this.config.apiKey } : {}),
        'X-Application': APP_NAME,
        'X-Platform': Platform.OS,
        'X-Version': APP_VERSION,
        ...this.config.headers,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout || 10000),
    });

    if (!response.ok) {
      let errorMessage = `Remote logging failed: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    // Log success at debug level
    if (__DEV__) {
      console.log(`📤 Sent ${entries.length} logs to remote server`);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RemoteTransportConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.batchSize) {
      this.batchSize = config.batchSize;
    }
    if (config.flushInterval) {
      this.flushInterval = config.flushInterval;
      this.startTimer();
    }
    if (config.minLevel) {
      this.minLevel = config.minLevel;
    }
    if (config.enabled !== undefined) {
      this.enabled = config.enabled;
      if (this.enabled) {
        this.startTimer();
      } else if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  /**
   * Force flush all pending logs
   */
  forceFlush(): void {
    this.flush();
  }

  /**
   * Get the current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length + this.retryQueue.length;
  }

  /**
   * Clear the buffer
   */
  clearBuffer(): void {
    this.buffer = [];
    this.retryQueue = [];
    this.retryAttempts = 0;
  }

  /**
   * Enable or disable the transport
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.startTimer();
    } else if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Get the current status
   */
  getStatus(): {
    enabled: boolean;
    minLevel: LogLevel;
    bufferSize: number;
    batchSize: number;
    flushInterval: number;
    url: string;
  } {
    return {
      enabled: this.enabled,
      minLevel: this.minLevel,
      bufferSize: this.getBufferSize(),
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
      url: this.config.url,
    };
  }

  /**
   * Destroy the transport
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
    this.buffer = [];
    this.retryQueue = [];
    this.retryAttempts = 0;
  }
}

export default RemoteTransport;
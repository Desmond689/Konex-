// @ts-nocheck
﻿/**
 * KONEX File Transport
 * Billion Dollar Code - Production Ready
 * Logs to files on the device for debugging and analysis
 */

import * as FileSystem from 'expo-file-system';
import { IS_DEVELOPMENT } from '../../../config/env.config';
import { LogEntry, LogFileInfo, LogTransport, LogLevel, LogFileInfo } from '../logger.types';

// ============================================
// 1. FILE TRANSPORT
// ============================================

export interface FileTransportOptions {
  path?: string;
  maxMemoryLogs?: number;
  maxFileSize?: number;
  maxFiles?: number;
  enabled?: boolean;
  minLevel?: LogLevel;
}

export class FileTransport implements LogTransport {
  private logs: LogEntry[] = [];
  private maxMemoryLogs: number = 10000;
  private filePath: string;
  private isWriting: boolean = false;
  private writeQueue: LogEntry[] = [];
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;
  private enabled: boolean = true;
  private minLevel: LogLevel = LogLevel.DEBUG;
  private writeTimer: NodeJS.Timeout | null = null;

  constructor(options: FileTransportOptions = {}) {
    this.filePath = options.path || `${FileSystem.documentDirectory}logs/`;
    this.maxMemoryLogs = options.maxMemoryLogs || 10000;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024;
    this.maxFiles = options.maxFiles || 5;
    this.enabled = options.enabled !== undefined ? options.enabled : IS_DEVELOPMENT;
    this.minLevel = options.minLevel || LogLevel.DEBUG;

    if (this.enabled) {
      this.ensureDirectoryExists();
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.filePath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.filePath, { intermediates: true });
        console.log('📁 Log directory created:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Failed to create log directory:', error);
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

    this.logs.push(entry);

    // Trim logs if they exceed maximum
    if (this.logs.length > this.maxMemoryLogs) {
      this.logs = this.logs.slice(-this.maxMemoryLogs);
    }

    // Write to file asynchronously
    this.queueWrite(entry);
  }

  private queueWrite(entry: LogEntry): void {
    this.writeQueue.push(entry);

    // Clear existing timer
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    // Write after a short delay to batch writes
    this.writeTimer = setTimeout(() => {
      this.processWriteQueue();
    }, 100);
  }

  private async processWriteQueue(): Promise<void> {
    if (this.writeQueue.length === 0 || this.isWriting) {
      return;
    }

    this.isWriting = true;
    const entries = [...this.writeQueue];
    this.writeQueue = [];
    this.writeTimer = null;

    try {
      // Check file size and rotate if needed
      await this.checkAndRotateFile();

      const logLines = entries
        .map((entry) => JSON.stringify({
          level: entry.level,
          message: entry.message,
          timestamp: entry.timestamp,
          data: entry.data,
          context: entry.context,
          metadata: entry.metadata,
          error: entry.error ? {
            message: entry.error.message,
            stack: entry.error.stack,
            name: entry.error.name,
          } : undefined,
        }))
        .join('\n') + '\n';

      const fileUri = this.getCurrentLogFileUri();
      await FileSystem.writeAsStringAsync(fileUri, logLines, {
        encoding: FileSystem.EncodingType.UTF8,
        // append: true, // not in expo-file-system WritingOptions

      });
    } catch (error) {
      console.error('❌ Failed to write log to file:', error);
      // Re-queue entries that failed
      this.writeQueue = [...entries, ...this.writeQueue];
    } finally {
      this.isWriting = false;
      // Process remaining queue if any
      if (this.writeQueue.length > 0) {
        this.processWriteQueue();
      }
    }
  }

  private async checkAndRotateFile(): Promise<void> {
    const fileUri = this.getCurrentLogFileUri();
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists && fileInfo.size && fileInfo.size > this.maxFileSize) {
      await this.rotateLogFile();
    }
  }

  private async rotateLogFile(): Promise<void> {
    try {
      const files = await this.getLogFiles();

      // Delete the oldest file if we have too many
      if (files.length >= this.maxFiles) {
        const sorted = files.sort((a, b) => {
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        });
        await FileSystem.deleteAsync(`${this.filePath}${sorted[0].name}`);
      }

      // Rename current file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const oldPath = this.getCurrentLogFileUri();
      const newPath = `${this.filePath}log_${timestamp}.log`;
      await FileSystem.moveAsync({ from: oldPath, to: newPath });
    } catch (error) {
      console.error('❌ Failed to rotate log file:', error);
    }
  }

  private getCurrentLogFileUri(): string {
    const date = new Date().toISOString().split('T')[0];
    return `${this.filePath}${date}.log`;
  }

  /**
   * Get all logs in memory
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by date
   */
  getLogsByDate(date: string): LogEntry[] {
    return this.logs.filter(
      (entry) => entry.timestamp.startsWith(date)
    );
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((entry) => entry.level === level);
  }

  /**
   * Get all log files
   */
  async getLogFiles(): Promise<LogFileInfo[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.filePath);
      const fileInfos: LogFileInfo[] = [];

      for (const file of files) {
        const info = await FileSystem.getInfoAsync(`${this.filePath}${file}`);
        if (info.exists) {
          fileInfos.push({
            name: file,
            size: info.size || 0,
            created: new Date(info.modificationTime || 0).toISOString(),
            modified: new Date(info.modificationTime || 0).toISOString(),
          });
        }
      }

      return fileInfos;
    } catch (error) {
      console.error('❌ Failed to read log files:', error);
      return [];
    }
  }

  /**
   * Get log file content
   */
  async getLogContent(filename: string): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(`${this.filePath}${filename}`);
    } catch (error) {
      console.error('❌ Failed to read log file:', error);
      return '';
    }
  }

  /**
   * Get log file content as JSON
   */
  async getLogContentAsJSON(filename: string): Promise<LogEntry[]> {
    try {
      const content = await this.getLogContent(filename);
      return content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as LogEntry[];
    } catch (error) {
      console.error('❌ Failed to parse log file:', error);
      return [];
    }
  }

  /**
   * Clear memory logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Clear all log files
   */
  async clearFiles(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.filePath);
      for (const file of files) {
        await FileSystem.deleteAsync(`${this.filePath}${file}`);
      }
      this.logs = [];
      console.log('🗑️ All log files cleared');
    } catch (error) {
      console.error('❌ Failed to clear log files:', error);
    }
  }

  /**
   * Get the total size of all log files
   */
  async getTotalSize(): Promise<number> {
    try {
      const files = await this.getLogFiles();
      return files.reduce((total, file) => total + file.size, 0);
    } catch (error) {
      console.error('❌ Failed to get total log size:', error);
      return 0;
    }
  }

  /**
   * Get the path where logs are stored
   */
  getLogPath(): string {
    return this.filePath;
  }

  /**
   * Enable or disable the transport
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.ensureDirectoryExists();
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
  getStatus(): { enabled: boolean; minLevel: LogLevel; path: string } {
    return {
      enabled: this.enabled,
      minLevel: this.minLevel,
      path: this.filePath,
    };
  }

  /**
   * Force flush all pending writes
   */
  async flush(): Promise<void> {
    if (this.writeQueue.length > 0) {
      await this.processWriteQueue();
    }
  }

  /**
   * Destroy the transport
   */
  destroy(): void {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    this.logs = [];
    this.writeQueue = [];
  }
}

export default FileTransport;
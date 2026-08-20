// @ts-nocheck
﻿/**
 * KONEX Performance Transport
 * Billion Dollar Code - Production Ready
 * Tracks performance metrics from logs
 */

import { LogEntry, LogLevel, LogTransport, PerformanceMetrics } from '../logger.types';

// ============================================
// 1. PERFORMANCE TRANSPORT
// ============================================

export interface PerformanceTransportOptions {
  enabled?: boolean;
  maxStoredValues?: number;
  thresholds?: Record<string, number>;
  minLevel?: LogLevel;
}

export interface MetricStats {
  count: number;
  total: number;
  min: number;
  max: number;
  avg: number;
  lastValue: number;
  lastTimestamp: string;
  values: number[];
}

export class PerformanceTransport implements LogTransport {
  private metrics: Map<string, MetricStats> = new Map();
  private maxStoredValues: number = 100;
  private thresholds: Map<string, number> = new Map();
  private enabled: boolean = true;
  private minLevel: LogLevel = LogLevel.INFO;
  private alertCallbacks: Map<string, ((metric: string, value: number, threshold: number) => void)> = new Map();

  constructor(options: PerformanceTransportOptions = {}) {
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.maxStoredValues = options.maxStoredValues || 100;
    this.minLevel = options.minLevel || LogLevel.INFO;

    if (options.thresholds) {
      Object.entries(options.thresholds).forEach(([key, value]) => {
        this.thresholds.set(key, value);
      });
    }
  }

  log(entry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    // Check if this is a performance log
    if (entry.context?.component !== 'performance') {
      return;
    }

    // Check minimum level
    const levels = Object.values(LogLevel);
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(entry.level);
    if (currentIndex < minIndex) {
      return;
    }

    const metricName = entry.context?.metric || 'unknown';
    const value = entry.data?.duration || 0;

    this.trackMetric(metricName, value, entry);
  }

  private trackMetric(name: string, value: number, entry: LogEntry): void {
    const existing = this.metrics.get(name) || {
      count: 0,
      total: 0,
      min: Infinity,
      max: -Infinity,
      avg: 0,
      lastValue: 0,
      lastTimestamp: entry.timestamp,
      values: [],
    };

    existing.count++;
    existing.total += value;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);
    existing.avg = existing.total / existing.count;
    existing.lastValue = value;
    existing.lastTimestamp = entry.timestamp;
    existing.values.push(value);

    // Trim values
    if (existing.values.length > this.maxStoredValues) {
      existing.values = existing.values.slice(-this.maxStoredValues);
    }

    this.metrics.set(name, existing);

    // Check threshold
    const threshold = this.thresholds.get(name);
    if (threshold && value > threshold) {
      // Log warning
      console.warn(`⚠️ Performance threshold exceeded for ${name}: ${value}ms > ${threshold}ms`);

      // Call alert callbacks
      const callbacks = this.alertCallbacks.get(name);
      if (callbacks) {
        callbacks(name, value, threshold);
      }
    }
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const result: PerformanceMetrics = {};
    this.metrics.forEach((value, key) => {
      result[key] = {
        name: key,
        count: value.count,
        total: value.total,
        min: value.min === Infinity ? 0 : value.min,
        max: value.max === -Infinity ? 0 : value.max,
        avg: value.avg,
      };
    });
    return result;
  }

  /**
   * Get detailed stats for a specific metric
   */
  getMetricStats(name: string): MetricStats | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      return null;
    }
    return {
      ...metric,
      values: [...metric.values],
    };
  }

  /**
   * Get recent values for a metric
   */
  getRecentValues(name: string, count?: number): number[] {
    const metric = this.metrics.get(name);
    if (!metric) {
      return [];
    }
    const values = [...metric.values];
    return count ? values.slice(-count) : values;
  }

  /**
   * Set a threshold for a metric
   */
  setThreshold(name: string, threshold: number): void {
    this.thresholds.set(name, threshold);
  }

  /**
   * Remove a threshold
   */
  removeThreshold(name: string): void {
    this.thresholds.delete(name);
  }

  /**
   * Get all thresholds
   */
  getThresholds(): Map<string, number> {
    return new Map(this.thresholds);
  }

  /**
   * Add an alert callback for a metric
   */
  onThresholdExceeded(name: string, callback: (metric: string, value: number, threshold: number) => void): void {
    this.alertCallbacks.set(name, callback);
  }

  /**
   * Remove an alert callback
   */
  removeAlertCallback(name: string): void {
    this.alertCallbacks.delete(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.thresholds.clear();
    this.alertCallbacks.clear();
  }

  /**
   * Clear a specific metric
   */
  clearMetric(name: string): void {
    this.metrics.delete(name);
    this.thresholds.delete(name);
    this.alertCallbacks.delete(name);
  }

  /**
   * Get the 95th percentile for a metric
   */
  getPercentile(name: string, percentile: number = 95): number | null {
    const metric = this.metrics.get(name);
    if (!metric || metric.values.length === 0) {
      return null;
    }

    const sorted = [...metric.values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * Get the standard deviation for a metric
   */
  getStandardDeviation(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric || metric.values.length === 0) {
      return null;
    }

    const avg = metric.avg;
    const squaredDiffs = metric.values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / metric.values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get the median for a metric
   */
  getMedian(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric || metric.values.length === 0) {
      return null;
    }

    const sorted = [...metric.values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  /**
   * Get a summary of all metrics
   */
  getSummary(): {
    metrics: PerformanceMetrics;
    total: {
      count: number;
      avg: number;
      min: number;
      max: number;
    };
    alerts: Map<string, number>;
  } {
    const metrics = this.getMetrics();
    let totalCount = 0;
    let totalSum = 0;
    let globalMin = Infinity;
    let globalMax = -Infinity;

    Object.values(metrics).forEach((metric: any) => {
      totalCount += metric.count;
      totalSum += metric.total;
      globalMin = Math.min(globalMin, metric.min);
      globalMax = Math.max(globalMax, metric.max);
    });

    return {
      metrics,
      total: {
        count: totalCount,
        avg: totalCount > 0 ? totalSum / totalCount : 0,
        min: globalMin === Infinity ? 0 : globalMin,
        max: globalMax === -Infinity ? 0 : globalMax,
      },
      alerts: this.getThresholds(),
    };
  }

  /**
   * Get the current status
   */
  getStatus(): {
    enabled: boolean;
    minLevel: LogLevel;
    metricsCount: number;
    thresholdsCount: number;
    maxStoredValues: number;
  } {
    return {
      enabled: this.enabled,
      minLevel: this.minLevel,
      metricsCount: this.metrics.size,
      thresholdsCount: this.thresholds.size,
      maxStoredValues: this.maxStoredValues,
    };
  }

  /**
   * Enable or disable the transport
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Set the maximum number of stored values per metric
   */
  setMaxStoredValues(max: number): void {
    this.maxStoredValues = max;
  }

  /**
   * Export all metrics data
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.metrics.forEach((value, key) => {
      data[key] = {
        stats: {
          count: value.count,
          total: value.total,
          min: value.min === Infinity ? 0 : value.min,
          max: value.max === -Infinity ? 0 : value.max,
          avg: value.avg,
          lastValue: value.lastValue,
          lastTimestamp: value.lastTimestamp,
        },
        values: [...value.values],
      };
    });
    return data;
  }

  /**
   * Import metrics data
   */
  importData(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (value.stats && value.values) {
        this.metrics.set(key, {
          count: value.stats.count || 0,
          total: value.stats.total || 0,
          min: value.stats.min || 0,
          max: value.stats.max || 0,
          avg: value.stats.avg || 0,
          lastValue: value.stats.lastValue || 0,
          lastTimestamp: value.stats.lastTimestamp || new Date().toISOString(),
          values: value.values || [],
        });
      }
    });
  }
}

export default PerformanceTransport;
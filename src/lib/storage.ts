/**
 * KONEX Storage Library
 * Billion Dollar Code - Production Ready
 * 
 * File storage utilities with caching and management
 * 
 * Usage:
 * import { saveFile, getFile, deleteFile, getCacheSize } from '@lib/storage';
 */

import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface FileInfo {
  uri: string;
  size: number;
  mimeType?: string;
  fileName?: string;
  createdAt: number;
  modifiedAt: number;
}

export interface StorageOptions {
  /** Cache directory */
  cacheDir?: string;
  /** Max cache size in bytes */
  maxCacheSize?: number;
  /** TTL in milliseconds */
  ttl?: number;
}

// ============================================
// 2. CONSTANTS
// ============================================

const DEFAULT_CACHE_DIR = `${FileSystem.cacheDirectory}kon_ex/`;
const DEFAULT_MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================
// 3. INITIALIZATION
// ============================================

/**
 * Ensure cache directory exists
 */
export const ensureCacheDir = async (cacheDir: string = DEFAULT_CACHE_DIR): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      logger.info('📁 Cache directory created', { cacheDir });
    }
  } catch (error) {
    logger.error('❌ Failed to ensure cache directory', { error });
  }
};

// ============================================
// 4. FILE OPERATIONS
// ============================================

/**
 * Save a file to cache
 */
export const saveFile = async (
  uri: string,
  fileName?: string,
  cacheDir: string = DEFAULT_CACHE_DIR
): Promise<string | null> => {
  try {
    await ensureCacheDir(cacheDir);

    const fileExt = uri.split('.').pop() || 'tmp';
    const name = fileName || `${Date.now()}.${fileExt}`;
    const hashedName = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      name + Date.now().toString()
    );
    const destination = `${cacheDir}${hashedName}.${fileExt}`;

    await FileSystem.copyAsync({
      from: uri,
      to: destination,
    });

    logger.info('💾 File saved to cache', { destination });
    return destination;
  } catch (error) {
    logger.error('❌ Failed to save file', { error });
    return null;
  }
};

/**
 * Get a file from cache
 */
export const getFile = async (
  uri: string,
  cacheDir: string = DEFAULT_CACHE_DIR
): Promise<string | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      logger.warn('⚠️ File not found in cache', { uri });
      return null;
    }

    return uri;
  } catch (error) {
    logger.error('❌ Failed to get file', { error });
    return null;
  }
};

/**
 * Delete a file from cache
 */
export const deleteFile = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri);
    logger.info('🗑️ File deleted from cache', { uri });
    return true;
  } catch (error) {
    logger.error('❌ Failed to delete file', { error });
    return false;
  }
};

/**
 * Get file info
 */
export const getFileInfo = async (uri: string): Promise<FileInfo | null> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      return null;
    }

    const stats = await FileSystem.getInfoAsync(uri);
    const name = uri.split('/').pop() || 'unknown';

    return {
      uri,
      size: stats.size || 0,
      fileName: name,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    logger.error('❌ Failed to get file info', { error });
    return null;
  }
};

// ============================================
// 5. CACHE MANAGEMENT
// ============================================

/**
 * Get cache size
 */
export const getCacheSize = async (cacheDir: string = DEFAULT_CACHE_DIR): Promise<number> => {
  try {
    const info = await FileSystem.getInfoAsync(cacheDir);
    if (!info.exists) {
      return 0;
    }

    // Get total size by iterating through files
    const files = await FileSystem.readDirectoryAsync(cacheDir);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
      if (fileInfo.exists) {
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize;
  } catch (error) {
    logger.error('❌ Failed to get cache size', { error });
    return 0;
  }
};

/**
 * Clear cache
 */
export const clearCache = async (cacheDir: string = DEFAULT_CACHE_DIR): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(cacheDir);
    if (info.exists) {
      await FileSystem.deleteAsync(cacheDir);
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }
    logger.info('🧹 Cache cleared');
  } catch (error) {
    logger.error('❌ Failed to clear cache', { error });
  }
};

/**
 * Clean old cache files based on TTL
 */
export const cleanCache = async (
  ttl: number = DEFAULT_TTL,
  cacheDir: string = DEFAULT_CACHE_DIR
): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(cacheDir);
    if (!info.exists) {
      return;
    }

    const files = await FileSystem.readDirectoryAsync(cacheDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = `${cacheDir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists && fileInfo.modificationTime) {
        const modifiedTime = new Date(fileInfo.modificationTime).getTime();
        if (now - modifiedTime > ttl) {
          await FileSystem.deleteAsync(filePath);
          logger.info('🗑️ Old cache file cleaned', { file });
        }
      }
    }
  } catch (error) {
    logger.error('❌ Failed to clean cache', { error });
  }
};

/**
 * Get cache usage statistics
 */
export const getCacheStats = async (cacheDir: string = DEFAULT_CACHE_DIR): Promise<{
  totalSize: number;
  fileCount: number;
  maxSize: number;
  usagePercentage: number;
}> => {
  try {
    const info = await FileSystem.getInfoAsync(cacheDir);
    if (!info.exists) {
      return {
        totalSize: 0,
        fileCount: 0,
        maxSize: DEFAULT_MAX_CACHE_SIZE,
        usagePercentage: 0,
      };
    }

    const files = await FileSystem.readDirectoryAsync(cacheDir);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
      if (fileInfo.exists) {
        totalSize += fileInfo.size || 0;
      }
    }

    return {
      totalSize,
      fileCount: files.length,
      maxSize: DEFAULT_MAX_CACHE_SIZE,
      usagePercentage: (totalSize / DEFAULT_MAX_CACHE_SIZE) * 100,
    };
  } catch (error) {
    logger.error('❌ Failed to get cache stats', { error });
    return {
      totalSize: 0,
      fileCount: 0,
      maxSize: DEFAULT_MAX_CACHE_SIZE,
      usagePercentage: 0,
    };
  }
};

// ============================================
// 6. DEFAULT EXPORT
// ============================================

export default {
  saveFile,
  getFile,
  deleteFile,
  getFileInfo,
  getCacheSize,
  clearCache,
  cleanCache,
  getCacheStats,
  ensureCacheDir,
};
/**
 * KONEX Media Service
 * Billion Dollar Code - Production Ready
 * 
 * Media validation and handling utilities
 * 
 * Usage:
 * import { validateLocalMedia, getLocalFileSizeBytes } from '@api/services/media.service';
 */

import * as FileSystem from 'expo-file-system';

// ============================================
// 1. CONSTANTS
// ============================================

export const ALLOWED_IMAGE_MIME: readonly string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
] as const;

export const ALLOWED_VIDEO_MIME: readonly string[] = [
  'video/mp4',
  'video/quicktime',
  'video/mov',
  'video/webm',
  'video/avi',
  'video/mkv',
] as const;

export const MEDIA_MAX_BYTES = 100 * 1024 * 1024; // 100MB
export const MEDIA_TOO_LARGE_MESSAGE = 'File is too large. Maximum size is 100MB.';

// ============================================
// 2. TYPES
// ============================================

export type LocalMediaKind = 'image' | 'video';

export interface LocalMediaValidationResult {
  size: number;
  mime: string;
  uri: string;
  kind: LocalMediaKind;
}

export interface GetFileInfoResult {
  uri: string;
  size: number;
  mimeType?: string;
  fileName?: string;
}

// ============================================
// 3. FILE SIZE HELPERS
// ============================================

/**
 * Get file size in bytes
 */
export async function getLocalFileSizeBytes(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      throw new Error(`File does not exist: ${uri}`);
    }

    if (info.isDirectory) {
      throw new Error('Path is a directory, not a file');
    }

    // FileSystem.getInfoAsync returns size as number when exists is true
    const size = 'size' in info ? (info as { size: number }).size : 0;

    if (typeof size !== 'number' || isNaN(size)) {
      return 0;
    }

    return size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file info (size, mime, name)
 */
export async function getFileInfo(uri: string): Promise<GetFileInfoResult> {
  const size = await getLocalFileSizeBytes(uri);

  // Extract file name from URI
  const fileName = uri.split('/').pop() || 'unknown';

  // Try to determine mime type from extension
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeType = getMimeTypeFromExtension(extension);

  return {
    uri,
    size,
    mimeType,
    fileName,
  };
}

// ============================================
// 4. MIME TYPE HELPERS
// ============================================

/**
 * Get mime type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | undefined {
  const mimeMap: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    
    // Videos
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    quicktime: 'video/quicktime',
    webm: 'video/webm',
    avi: 'video/avi',
    mkv: 'video/mkv',
    m4v: 'video/mp4',
    mpeg: 'video/mpeg',
  };

  return mimeMap[extension.toLowerCase()];
}

/**
 * Check if mime type is allowed for a given kind
 */
export function isAllowedMime(mime: string | undefined, kind: LocalMediaKind): boolean {
  if (!mime) return false;
  
  const normalizedMime = mime.toLowerCase();
  const allowedList = kind === 'image' ? ALLOWED_IMAGE_MIME : ALLOWED_VIDEO_MIME;
  
  return allowedList.includes(normalizedMime);
}

// ============================================
// 5. MIME VALIDATION
// ============================================

/**
 * Assert that mime type is allowed
 * @throws Error if mime type is not allowed
 */
export function assertAllowedMime(mime: string | undefined, kind: LocalMediaKind): void {
  const normalizedMime = (mime || '').toLowerCase();

  if (!normalizedMime) {
    throw new Error(
      kind === 'image'
        ? 'Image mime type is required. Please provide a valid image file.'
        : 'Video mime type is required. Please provide a valid video file.'
    );
  }

  const allowedList = kind === 'image' ? ALLOWED_IMAGE_MIME : ALLOWED_VIDEO_MIME;

  if (!allowedList.includes(normalizedMime)) {
    const allowedFormats = allowedList.map(m => m.split('/')[1].toUpperCase()).join(', ');
    throw new Error(
      kind === 'image'
        ? `Unsupported image type. Allowed formats: ${allowedFormats}`
        : `Unsupported video type. Allowed formats: ${allowedFormats}`
    );
  }
}

// ============================================
// 6. MEDIA VALIDATION
// ============================================

/**
 * Validate local media file
 * @throws Error if validation fails
 */
export async function validateLocalMedia(params: {
  uri: string;
  mime?: string;
  kind: LocalMediaKind;
  maxBytes?: number;
}): Promise<LocalMediaValidationResult> {
  const { uri, mime, kind, maxBytes = MEDIA_MAX_BYTES } = params;

  // Validate mime type
  assertAllowedMime(mime, kind);

  // Get file size
  const size = await getLocalFileSizeBytes(uri);

  if (size <= 0) {
    throw new Error('Could not determine file size. The file may be empty or corrupted.');
  }

  if (size > maxBytes) {
    const maxMB = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File is too large. Maximum size is ${maxMB}MB.`);
  }

  // Determine mime type from file if not provided
  let finalMime = mime;
  if (!finalMime) {
    const info = await getFileInfo(uri);
    finalMime = info.mimeType;
  }

  return {
    uri,
    size,
    mime: finalMime || '',
    kind,
  };
}

/**
 * Validate multiple media files
 */
export async function validateMultipleMedia(
  files: Array<{ uri: string; mime?: string; kind: LocalMediaKind }>,
  maxBytes?: number
): Promise<LocalMediaValidationResult[]> {
  const results: LocalMediaValidationResult[] = [];

  for (const file of files) {
    const result = await validateLocalMedia({
      ...file,
      maxBytes,
    });
    results.push(result);
  }

  return results;
}

// ============================================
// 7. FILE SIZE HELPERS
// ============================================

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if file size is under limit
 */
export function isFileSizeValid(bytes: number, maxBytes: number = MEDIA_MAX_BYTES): boolean {
  return bytes > 0 && bytes <= maxBytes;
}

/**
 * Get max file size in MB
 */
export function getMaxSizeMB(maxBytes: number = MEDIA_MAX_BYTES): number {
  return Math.round(maxBytes / (1024 * 1024));
}

// ============================================
// 8. DEFAULT EXPORT
// ============================================

export default {
  ALLOWED_IMAGE_MIME,
  ALLOWED_VIDEO_MIME,
  MEDIA_MAX_BYTES,
  MEDIA_TOO_LARGE_MESSAGE,
  getLocalFileSizeBytes,
  getFileInfo,
  getMimeTypeFromExtension,
  isAllowedMime,
  assertAllowedMime,
  validateLocalMedia,
  validateMultipleMedia,
  formatFileSize,
  isFileSizeValid,
  getMaxSizeMB,
};
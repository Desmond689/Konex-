/**
 * KONEX Media Constants
 * Billion Dollar Code - Production Ready
 * 
 * Media-related constants for upload and validation
 * 
 * Usage:
 * import { 
 *   MEDIA_MAX_BYTES, 
 *   ALLOWED_IMAGE_MIME, 
 *   ALLOWED_VIDEO_MIME,
 *   MediaProcessingStatus 
 * } from '@api/media/media.constants';
 */

// ============================================
// 1. SIZE LIMITS
// ============================================

export const MEDIA_MAX_BYTES = 50 * 1024 * 1024; // 50MB
export const MEDIA_MAX_VIDEO_DURATION_SEC = 90; // 90 seconds

// ============================================
// 2. ERROR MESSAGES
// ============================================

export const MEDIA_TOO_LARGE_MESSAGE =
  'This file is too large. The maximum allowed size is 50 MB.';

export const MEDIA_VIDEO_TOO_LONG_MESSAGE =
  'This video is too long. The maximum allowed duration is 90 seconds.';

export const MEDIA_INVALID_TYPE_MESSAGE =
  'Invalid file type. Please upload a supported image or video format.';

// ============================================
// 3. MIME TYPES
// ============================================

export const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_VIDEO_MIME = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
] as const;

// ============================================
// 4. STATUS TYPES
// ============================================

export type MediaProcessingStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'cancelled'
  | 'deleted';

// ============================================
// 5. HELPERS
// ============================================

/**
 * Check if a mime type is a supported image
 */
export const isSupportedImage = (mime: string): boolean => {
  return ALLOWED_IMAGE_MIME.includes(mime as any);
};

/**
 * Check if a mime type is a supported video
 */
export const isSupportedVideo = (mime: string): boolean => {
  return ALLOWED_VIDEO_MIME.includes(mime as any);
};

/**
 * Check if a mime type is supported (image or video)
 */
export const isSupportedMedia = (mime: string): boolean => {
  return isSupportedImage(mime) || isSupportedVideo(mime);
};

/**
 * Get file extension from mime type
 */
export const getExtensionFromMime = (mime: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'video/x-m4v': 'm4v',
  };
  return map[mime] || 'bin';
};

// ============================================
// 6. DEFAULT EXPORT
// ============================================

export default {
  MEDIA_MAX_BYTES,
  MEDIA_MAX_VIDEO_DURATION_SEC,
  MEDIA_TOO_LARGE_MESSAGE,
  MEDIA_VIDEO_TOO_LONG_MESSAGE,
  MEDIA_INVALID_TYPE_MESSAGE,
  ALLOWED_IMAGE_MIME,
  ALLOWED_VIDEO_MIME,
  isSupportedImage,
  isSupportedVideo,
  isSupportedMedia,
  getExtensionFromMime,
};
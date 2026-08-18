export const MEDIA_MAX_BYTES = 50 * 1024 * 1024;
export const MEDIA_MAX_VIDEO_DURATION_SEC = 90;
export const MEDIA_TOO_LARGE_MESSAGE =
  'This file is too large. The maximum allowed size is 50 MB.';

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

export type MediaProcessingStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'cancelled'
  | 'deleted';

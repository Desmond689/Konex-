import * as FileSystem from 'expo-file-system';
import { MEDIA_MAX_BYTES } from '../../../api/media/media.constants';

export async function getFileSizeBytes(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) throw new Error('Video file not found');
  return typeof (info as any).size === 'number' ? (info as any).size : 0;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Rough estimate after trim: proportional to duration ratio (bitrate assumed constant). */
export function estimateTrimmedSize(
  originalBytes: number,
  originalDurationSec: number,
  startSec: number,
  endSec: number
): number {
  if (originalDurationSec <= 0) return originalBytes;
  const span = Math.max(0.1, endSec - startSec);
  return Math.ceil(originalBytes * (span / originalDurationSec));
}

export function isWithinLimit(bytes: number): boolean {
  return bytes > 0 && bytes <= MEDIA_MAX_BYTES;
}

export { MEDIA_MAX_BYTES };

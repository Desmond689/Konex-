import * as FileSystem from 'expo-file-system';
import {
  ALLOWED_IMAGE_MIME,
  ALLOWED_VIDEO_MIME,
  MEDIA_MAX_BYTES,
  MEDIA_TOO_LARGE_MESSAGE,
} from './media.constants';

export type LocalMediaKind = 'image' | 'video';

export async function getLocalFileSizeBytes(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || (info as any).isDirectory) {
    throw new Error('File does not exist or is invalid');
  }
  return typeof (info as any).size === 'number' ? (info as any).size : 0;
}

export function assertAllowedMime(mime: string | undefined, kind: LocalMediaKind) {
  const m = (mime || '').toLowerCase();
  const list = kind === 'image' ? ALLOWED_IMAGE_MIME : ALLOWED_VIDEO_MIME;
  if (!m || !list.includes(m as any)) {
    throw new Error(
      kind === 'image'
        ? 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.'
        : 'Unsupported video type. Use MP4, MOV, or WebM.'
    );
  }
}

export async function validateLocalMedia(params: {
  uri: string;
  mime?: string;
  kind: LocalMediaKind;
}): Promise<{ size: number }> {
  assertAllowedMime(params.mime, params.kind);
  const size = await getLocalFileSizeBytes(params.uri);
  if (size <= 0) throw new Error('Could not determine file size');
  if (size > MEDIA_MAX_BYTES) throw new Error(MEDIA_TOO_LARGE_MESSAGE);
  return { size };
}

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../client/supabase.client';
import { MEDIA_MAX_BYTES, MEDIA_TOO_LARGE_MESSAGE, MediaProcessingStatus } from './media.constants';
import { validateLocalMedia, LocalMediaKind } from './mediaValidate';
import { uploadVideoToApiVideo } from './apiVideo.service';

export type UploadProgress = {
  phase: 'validating' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  percent?: number;
  loadedBytes?: number;
  totalBytes?: number;
  message?: string;
};

export type MediaAssetRecord = {
  id?: string;
  user_id: string;
  media_type: 'image' | 'video';
  storage_path?: string;
  bucket?: string;
  public_url: string;
  thumbnail_url?: string | null;
  video_id?: string | null;
  hls_url?: string | null;
  duration_sec?: number | null;
  file_size: number;
  mime_type?: string | null;
  status: MediaProcessingStatus;
};

type UploadOpts = {
  userId: string;
  uri: string;
  mime?: string;
  kind: LocalMediaKind;
  durationSec?: number;
  onProgress?: (p: UploadProgress) => void;
  cancelRef?: { cancelled: boolean };
};

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  return res.arrayBuffer();
}

export class MediaUploadService {
  async uploadLocalMedia(opts: UploadOpts): Promise<MediaAssetRecord> {
    const { userId, uri, mime, kind, durationSec, onProgress, cancelRef } = opts;

    if (kind === 'video') {
      const video = await uploadVideoToApiVideo({
        uri,
        mime,
        durationSec,
        cancelRef,
        onProgress,
        title: `konex_${userId}_${Date.now()}`,
      });

      if (video.status !== 'ready' && !video.mp4_url && !video.hls_url) {
        // Do not treat as publishable if nothing playable yet
        throw new Error(
          'Video is still processing on api.video. Wait and retry, or check api-video-status.'
        );
      }

      const record: MediaAssetRecord = {
        user_id: userId,
        media_type: 'video',
        public_url: video.mp4_url || video.hls_url || video.player_url || '',
        thumbnail_url: video.thumbnail_url,
        video_id: video.video_id,
        hls_url: video.hls_url,
        file_size: video.file_size,
        mime_type: mime || 'video/mp4',
        status: video.status === 'ready' ? 'ready' : 'processing',
        duration_sec: durationSec ?? null,
      };

      await this.saveMetadata(record);
      return record;
    }

    // Images → Supabase Storage
    onProgress?.({ phase: 'validating', message: 'Validating image…' });
    const { size } = await validateLocalMedia({
      uri,
      mime: mime || 'image/jpeg',
      kind: 'image',
    });
    if (cancelRef?.cancelled) {
      const e = new Error('Upload cancelled');
      (e as any).code = 'UPLOAD_CANCELLED';
      throw e;
    }

    let uploadUri = uri;
    let outMime = mime || 'image/jpeg';
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      uploadUri = result.uri;
      outMime = 'image/jpeg';
    } catch {
      /* use original */
    }

    onProgress?.({ phase: 'uploading', percent: 20, message: 'Uploading image…' });
    const path = `${userId}/${Date.now()}.jpg`;
    const body = await uriToArrayBuffer(uploadUri);
    if (body.byteLength > MEDIA_MAX_BYTES) throw new Error(MEDIA_TOO_LARGE_MESSAGE);

    const { error } = await supabase.storage.from('posts').upload(path, body, {
      contentType: outMime,
      upsert: true,
    });
    if (error) throw error;

    const public_url = supabase.storage.from('posts').getPublicUrl(path).data.publicUrl;
    onProgress?.({ phase: 'completed', percent: 100, message: 'Ready' });

    const record: MediaAssetRecord = {
      user_id: userId,
      media_type: 'image',
      storage_path: path,
      bucket: 'posts',
      public_url,
      file_size: size,
      mime_type: outMime,
      status: 'ready',
    };
    await this.saveMetadata(record);
    return record;
  }

  private async saveMetadata(record: MediaAssetRecord) {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          user_id: record.user_id,
          media_type: record.media_type,
          storage_path: record.storage_path || record.video_id || '',
          bucket: record.bucket || 'api.video',
          public_url: record.public_url,
          thumbnail_url: record.thumbnail_url,
          file_size: record.file_size,
          mime_type: record.mime_type,
          status: record.status,
          duration_sec: record.duration_sec,
        })
        .select('id')
        .single();
      if (!error && data?.id) record.id = data.id;
    } catch {
      /* table optional until migration */
    }
  }
}

export const mediaUploadService = new MediaUploadService();
export default mediaUploadService;

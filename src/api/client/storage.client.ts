// src/api/client/storage.client.ts
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { storageClient } from './supabase.client';

// ============================================
// 1. STORAGE BUCKETS
// ============================================

export const StorageBuckets = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  SQUAD_ICONS: 'squad_icons',
  COMMUNITY_LOGOS: 'community_logos',
  POST_IMAGES: 'post_images',
  POST_CLIPS: 'post_clips',
  STORY_IMAGES: 'story_images',
  STORY_VIDEOS: 'story_videos',
  TOURNAMENT_BANNERS: 'tournament_banners',
  REPORT_EVIDENCE: 'report_evidence',
  APPEAL_EVIDENCE: 'appeal_evidence',
} as const;

export type StorageBucket = typeof StorageBuckets[keyof typeof StorageBuckets];

// ============================================
// 2. STORAGE SERVICE
// ============================================

class StorageService {
  private static instance: StorageService;
  private uploadProgress: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // ============================================
  // 3. UPLOAD METHODS
  // ============================================

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    bucket: StorageBucket,
    path: string,
    fileUri: string,
    options: {
      contentType?: string;
      cacheControl?: string;
      upsert?: boolean;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<string> {
    try {
      logger.info(`📤 Uploading file to ${bucket}/${path}`);

      const client = storageClient();
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        throw new KonexError(
          ErrorCode.STORAGE_FILE_NOT_FOUND,
          'File not found',
          'The file you are trying to upload could not be found.',
          ErrorSeverity.ERROR,
          { fileUri }
        );
      }

      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileBlob = new Blob(
        [Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0))],
        { type: options.contentType || 'application/octet-stream' }
      );

      const { data, error } = await client
        .from(bucket)
        .upload(path, fileBlob, {
          contentType: options.contentType,
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
        });

      if (error) {
        throw new KonexError(
          ErrorCode.STORAGE_UPLOAD_ERROR,
          error.message,
          'Failed to upload file. Please try again.',
          ErrorSeverity.ERROR,
          { error }
        );
      }

      const { data: urlData } = client.from(bucket).getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      logger.info(`✅ File uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      if (error instanceof KonexError) throw error;

      logger.error('❌ Upload failed', { error, bucket, path });
      throw new KonexError(
        ErrorCode.STORAGE_UPLOAD_ERROR,
        'Upload failed',
        'Failed to upload file. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  /**
   * Upload an image with optimization
   */
  async uploadImage(
    bucket: StorageBucket,
    path: string,
    imageUri: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      compress?: boolean;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<string> {
    try {
      logger.info(`🖼️ Uploading image to ${bucket}/${path}`);

      let processedUri = imageUri;

      if (options.compress !== false) {
        const manipulatorResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            {
              resize: {
                width: options.maxWidth || 2048,
                height: options.maxHeight || 2048,
              },
            },
          ],
          {
            compress: options.quality || 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        processedUri = manipulatorResult.uri;
      }

      const fileInfo = await FileSystem.getInfoAsync(processedUri);
      const fileSize = fileInfo.exists ? (fileInfo as { size?: number }).size ?? 0 : 0;

      logger.debug(`📊 Image size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

      return this.uploadFile(bucket, path, processedUri, {
        contentType: 'image/jpeg',
        cacheControl: '86400',
        onProgress: options.onProgress,
      });
    } catch (error) {
      if (error instanceof KonexError) throw error;

      logger.error('❌ Image upload failed', { error, bucket, path });
      throw new KonexError(
        ErrorCode.STORAGE_UPLOAD_ERROR,
        'Image upload failed',
        'Failed to upload image. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  /**
   * Upload a video clip
   */
  async uploadVideo(
    bucket: StorageBucket,
    path: string,
    videoUri: string,
    options: {
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<string> {
    try {
      logger.info(`🎥 Uploading video to ${bucket}/${path}`);

      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      const fileSize = fileInfo.exists ? (fileInfo as { size?: number }).size ?? 0 : 0;

      if (fileSize > 50 * 1024 * 1024) {
        throw new KonexError(
          ErrorCode.STORAGE_UPLOAD_ERROR,
          'File too large',
          'Video file must be less than 50MB.',
          ErrorSeverity.WARNING,
          { fileSize }
        );
      }

      return this.uploadFile(bucket, path, videoUri, {
        contentType: 'video/mp4',
        cacheControl: '86400',
        onProgress: options.onProgress,
      });
    } catch (error) {
      if (error instanceof KonexError) throw error;

      logger.error('❌ Video upload failed', { error, bucket, path });
      throw new KonexError(
        ErrorCode.STORAGE_UPLOAD_ERROR,
        'Video upload failed',
        'Failed to upload video. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  // ============================================
  // 4. DELETE METHODS
  // ============================================

  async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
    try {
      logger.info(`🗑️ Deleting file from ${bucket}/${path}`);

      const client = storageClient();
      const { error } = await client.from(bucket).remove([path]);

      if (error) {
        throw new KonexError(
          ErrorCode.STORAGE_UPLOAD_ERROR,
          error.message,
          'Failed to delete file.',
          ErrorSeverity.ERROR,
          { error }
        );
      }

      logger.info(`✅ File deleted: ${path}`);
    } catch (error) {
      if (error instanceof KonexError) throw error;

      logger.error('❌ Delete failed', { error, bucket, path });
      throw new KonexError(
        ErrorCode.STORAGE_UPLOAD_ERROR,
        'Delete failed',
        'Failed to delete file. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
    try {
      logger.info(`🗑️ Deleting ${paths.length} files from ${bucket}`);

      const client = storageClient();
      const { error } = await client.from(bucket).remove(paths);

      if (error) {
        throw new KonexError(
          ErrorCode.STORAGE_UPLOAD_ERROR,
          error.message,
          'Failed to delete files.',
          ErrorSeverity.ERROR,
          { error }
        );
      }

      logger.info(`✅ ${paths.length} files deleted`);
    } catch (error) {
      if (error instanceof KonexError) throw error;

      logger.error('❌ Batch delete failed', { error, bucket });
      throw new KonexError(
        ErrorCode.STORAGE_UPLOAD_ERROR,
        'Delete failed',
        'Failed to delete files. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  // ============================================
  // 5. GET METHODS
  // ============================================

  getPublicUrl(bucket: StorageBucket, path: string): string {
    try {
      const client = storageClient();
      const { data } = client.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      logger.error('❌ Failed to get public URL', { error, bucket, path });
      throw new KonexError(
        ErrorCode.STORAGE_DOWNLOAD_ERROR,
        'URL generation failed',
        'Failed to get file URL.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const client = storageClient();
      const { data, error } = await client
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      logger.error('❌ Failed to get signed URL', { error, bucket, path });
      throw new KonexError(
        ErrorCode.STORAGE_DOWNLOAD_ERROR,
        'Signed URL generation failed',
        'Failed to get secure file URL.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  // ============================================
  // 6. UTILITY METHODS
  // ============================================

  generatePath(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}_${random}.${extension}`;
  }

  getFileExtension(uri: string): string {
    const parts = uri.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  async fileExists(bucket: StorageBucket, path: string): Promise<boolean> {
    try {
      const client = storageClient();
      const { data, error } = await client.from(bucket).list(path);

      if (error) {
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getFileSize(bucket: StorageBucket, path: string): Promise<number> {
    try {
      const client = storageClient();
      const { data, error } = await client.from(bucket).list(path);

      if (error || !data || data.length === 0) {
        return 0;
      }

      return data[0].metadata?.size || 0;
    } catch (error) {
      return 0;
    }
  }
}

// ============================================
// 7. EXPORT SINGLETON
// ============================================

export const storageService = StorageService.getInstance();

// ============================================
// 8. CONVENIENCE FUNCTIONS
// ============================================

export const uploadAvatar = async (
  userId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const path = storageService.generatePath(userId, 'jpg');
  return storageService.uploadImage(StorageBuckets.AVATARS, path, imageUri, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.8,
    onProgress,
  });
};

export const uploadPostImage = async (
  postId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const path = storageService.generatePath(postId, 'jpg');
  return storageService.uploadImage(StorageBuckets.POST_IMAGES, path, imageUri, {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.8,
    onProgress,
  });
};

export const uploadSquadIcon = async (
  squadId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const path = storageService.generatePath(squadId, 'jpg');
  return storageService.uploadImage(StorageBuckets.SQUAD_ICONS, path, imageUri, {
    maxWidth: 256,
    maxHeight: 256,
    quality: 0.9,
    onProgress,
  });
};

export default storageService;
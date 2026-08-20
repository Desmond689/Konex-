/**
 * KONEX Storage - Main Entry Point
 * Billion Dollar Code - Production Ready
 */

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { supabase } from './client/supabase.client';

// ============================================
// TYPES
// ============================================

export type StorageBucket = 
  | 'avatars' 
  | 'posts' 
  | 'stories' 
  | 'chat' 
  | 'squads' 
  | 'communities' 
  | 'tournaments'
  | 'badges';

export interface UploadOptions {
  bucket: StorageBucket;
  folder?: string;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
}

export interface StorageFile {
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface StorageListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// STORAGE MANAGER CLASS
// ============================================

class StorageManager {
  private static instance: StorageManager;
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB KONEX media rule
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'];

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: { uri: string; type?: string; name?: string },
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Validate file
      const fileInfo = await this.getFileInfo(file.uri);
      if (!fileInfo) {
        throw new Error('File does not exist or is invalid');
      }

      if (fileInfo.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      }

      // Process file
      let processedUri = file.uri;
      let fileType = file.type || this.getMimeType(file.uri);
      let fileName = file.name || this.generateFileName(file.uri, fileType);

      // Compress image if needed
      if (options.compress && fileType.startsWith('image/')) {
        const result = await this.compressImage(processedUri, {
          maxWidth: options.maxWidth || 1200,
          maxHeight: options.maxHeight || 1200,
          quality: options.quality || 80,
        });
        processedUri = result.uri;
        fileType = result.type || fileType;
        fileName = result.name || fileName;
      }

      // Build path
      const path = this.buildPath(options, fileName);

      // Convert to blob
      const blob = await this.uriToBlob(processedUri);

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(path, blob, {
          contentType: fileType,
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        bucket: options.bucket,
        size: blob.size || fileInfo.size,
        mimeType: fileType,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('uploadFile error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Array<{ uri: string; type?: string; name?: string }>,
    options: UploadOptions
  ): Promise<UploadResult[]> {
    try {
      const results = await Promise.all(
        files.map((file) => this.uploadFile(file, options))
      );
      return results;
    } catch (error) {
      console.error('uploadFiles error:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('deleteFile error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
    } catch (error) {
      console.error('deleteFiles error:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(bucket: StorageBucket, path: string): Promise<StorageFile | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 1,
        });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const file = data[0];
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);

        return {
          name: file.name,
          url: urlData.publicUrl,
          path,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'unknown',
          createdAt: file.created_at || new Date().toISOString(),
          metadata: file.metadata,
        };
      }
      
      return null;
    } catch (error) {
      console.error('getFileMetadata error:', error);
      return null;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    bucket: StorageBucket,
    folder: string,
    options?: StorageListOptions
  ): Promise<StorageFile[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: options?.limit || 100,
          offset: options?.offset || 0,
          sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const files: StorageFile[] = [];
      
      for (const item of data || []) {
        const path = folder ? `${folder}/${item.name}` : item.name;
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);

        files.push({
          name: item.name,
          url: urlData.publicUrl,
          path,
          size: item.metadata?.size || 0,
          type: item.metadata?.mimetype || 'unknown',
          createdAt: item.created_at || new Date().toISOString(),
          metadata: item.metadata,
        });
      }

      return files;
    } catch (error) {
      console.error('listFiles error:', error);
      return [];
    }
  }

  /**
   * Get signed URL for private file
   */
  async getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('getSignedUrl error:', error);
      return null;
    }
  }

  /**
   * Move file
   */
  async moveFile(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) throw error;
    } catch (error) {
      console.error('moveFile error:', error);
      throw error;
    }
  }

  /**
   * Copy file
   */
  async copyFile(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath);

      if (error) throw error;
    } catch (error) {
      console.error('copyFile error:', error);
      throw error;
    }
  }

  /**
   * Upload from base64
   */
  async uploadFromBase64(
    base64: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Convert base64 to blob
      const blob = await this.base64ToBlob(base64);
      
      // Create file object
      const fileName = this.generateFileName('file', blob.type);
      const file = {
        uri: '',
        type: blob.type,
        name: fileName,
      };

      // Upload using the file
      return await this.uploadFile(file, options);
    } catch (error) {
      console.error('uploadFromBase64 error:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private async getFileInfo(uri: string): Promise<{ size: number; uri: string } | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, use fetch to get file info
        const response = await fetch(uri);
        const blob = await response.blob();
        return {
          size: blob.size,
          uri,
        };
      }

      // For native platforms
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        return {
          size: fileInfo.size || 0,
          uri,
        };
      }
      return null;
    } catch (error) {
      console.error('getFileInfo error:', error);
      return null;
    }
  }

  private async compressImage(
    uri: string,
    options: { maxWidth: number; maxHeight: number; quality: number }
  ): Promise<{ uri: string; type: string; name: string }> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: options.maxWidth,
              height: options.maxHeight,
            },
          },
        ],
        {
          compress: options.quality / 100,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return {
        uri: result.uri,
        type: 'image/jpeg',
        name: `${Date.now()}.jpg`,
      };
    } catch (error) {
      console.error('compressImage error:', error);
      return { uri, type: 'image/jpeg', name: `${Date.now()}.jpg` };
    }
  }

  private async uriToBlob(uri: string): Promise<Blob> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('uriToBlob error:', error);
      throw error;
    }
  }

  private async base64ToBlob(base64: string): Promise<Blob> {
    try {
      const response = await fetch(base64);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('base64ToBlob error:', error);
      throw error;
    }
  }

  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      heic: 'image/heic',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      pdf: 'application/pdf',
      txt: 'text/plain',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  private generateFileName(uri: string, type?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    const extension = uri.split('.').pop() || this.getExtensionFromMime(type || '') || 'jpg';
    return `file_${timestamp}_${random}.${extension}`;
  }

  private getExtensionFromMime(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'application/pdf': 'pdf',
    };
    return extensions[mimeType] || 'jpg';
  }

  private buildPath(options: UploadOptions, fileName: string): string {
    const parts = [];
    if (options.folder) parts.push(options.folder);
    parts.push(fileName);
    return parts.join('/');
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const storage = StorageManager.getInstance();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Upload profile avatar
 */
export const uploadAvatar = async (
  file: { uri: string; type?: string; name?: string },
  userId: string
): Promise<UploadResult> => {
  return storage.uploadFile(file, {
    bucket: 'avatars',
    folder: userId,
    compress: true,
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
  });
};

/**
 * Upload post image
 */
export const uploadPostImage = async (
  file: { uri: string; type?: string; name?: string },
  postId: string
): Promise<UploadResult> => {
  return storage.uploadFile(file, {
    bucket: 'posts',
    folder: postId,
    compress: true,
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
  });
};

/**
 * Upload story
 */
export const uploadStory = async (
  file: { uri: string; type?: string; name?: string },
  userId: string
): Promise<UploadResult> => {
  const isVideo = file.type?.startsWith('video/') || false;
  return storage.uploadFile(file, {
    bucket: 'stories',
    folder: userId,
    compress: isVideo ? false : true,
    maxWidth: isVideo ? undefined : 1080,
    maxHeight: isVideo ? undefined : 1920,
    quality: isVideo ? undefined : 80,
  });
};

/**
 * Upload chat attachment
 */
export const uploadChatAttachment = async (
  file: { uri: string; type?: string; name?: string },
  chatId: string
): Promise<UploadResult> => {
  return storage.uploadFile(file, {
    bucket: 'chat',
    folder: chatId,
    compress: false,
  });
};

/**
 * Upload squad logo
 */
export const uploadSquadLogo = async (
  file: { uri: string; type?: string; name?: string },
  squadId: string
): Promise<UploadResult> => {
  return storage.uploadFile(file, {
    bucket: 'squads',
    folder: squadId,
    compress: true,
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
  });
};

// ============================================
// EXPORT DEFAULTS
// ============================================

export default storage;
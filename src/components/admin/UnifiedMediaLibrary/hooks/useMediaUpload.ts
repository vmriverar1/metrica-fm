/**
 * useMediaUpload Hook
 * Manages file upload process with validation, resize, and conversion
 */

import { useState, useCallback } from 'react';
import type { UploadConfiguration, UseMediaUploadReturn } from '../types';
import apiClient from '@/lib/api-client';

interface UseMediaUploadOptions {
  config: UploadConfiguration;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useMediaUpload(options: UseMediaUploadOptions): UseMediaUploadReturn {
  const { config, onSuccess, onError } = options;

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (files?: File[]) => {
    const filesToUpload = files || uploadFiles;

    if (filesToUpload.length === 0) {
      console.warn('[useMediaUpload] No files to upload');
      return;
    }

    setUploading(true);

    try {
      console.log(`[useMediaUpload] Starting upload of ${filesToUpload.length} files`);

      // TODO: Implement validation, resize, and WebP conversion
      // For now, simple upload
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.upload('/api/admin/media/upload', formData);

      if (response.success) {
        console.log('[useMediaUpload] Upload successful');
        setUploadFiles([]);
        if (onSuccess) {
          await onSuccess();
        }
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during upload');
      console.error('[useMediaUpload] Upload error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setUploading(false);
    }
  }, [uploadFiles, config, onSuccess, onError]);

  const resetUpload = useCallback(() => {
    setUploadFiles([]);
  }, []);

  return {
    uploadFiles,
    setUploadFiles,
    uploading,
    handleUpload,
    resetUpload,
  };
}

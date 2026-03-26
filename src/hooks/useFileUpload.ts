'use client';

import { useState, useCallback } from 'react';
import {
  CLOUDINARY_UPLOAD_URL,
  cloudinaryConfig,
  getResourceTypeFromFile,
  isCloudinaryConfigured,
  type CloudinaryUploadResponse,
} from '@/lib/cloudinary';

export type { CloudinaryUploadResponse };

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: Error | null;
  url: string | null;
  publicId?: string;
}

export interface UseFileUploadReturn {
  upload: (file: File) => Promise<CloudinaryUploadResponse | null>;
  uploadState: FileUploadState;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null,
    publicId: undefined,
  });

  const upload = useCallback(async (
    file: File
  ): Promise<CloudinaryUploadResponse | null> => {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      const error = new Error('Cloudinary is not configured. Please set up environment variables.');
      setUploadState({
        uploading: false,
        progress: 0,
        error,
        url: null,
        publicId: undefined,
      });
      return null;
    }

    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      url: null,
      publicId: undefined,
    });

    try {
      // Determine resource type from file
      const resourceType = getResourceTypeFromFile(file);

      // Read file as base64 for more reliable uploads
      const reader = new FileReader();
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:image/png;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create form data for Cloudinary upload
      const formData = new FormData();
      
      // Add file as base64 data URL
      formData.append('file', `data:${file.type};base64,${base64Data}`);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('cloud_name', cloudinaryConfig.cloudName);
      
      // Add resource type for proper handling
      if (resourceType !== 'raw') {
        formData.append('resource_type', resourceType);
      }

      // Use public_id and filename_override to avoid issues with special characters in filenames
      // This prevents "Display name cannot contain slashes" error
      const publicId = `cogniflow_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      formData.append('public_id', publicId);
      formData.append('filename_override', publicId);

      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      // Get response text first to see error details
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Cloudinary upload failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data: CloudinaryUploadResponse = JSON.parse(responseText);

      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        url: data.secure_url,
        publicId: data.public_id,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Upload failed');
      console.error('Cloudinary upload error:', errorMessage.message);
      
      // Provide more helpful error message for common issues
      if (errorMessage.message.includes('Upload preset not found')) {
        console.error('\n⚠️ Please create an upload preset in Cloudinary Dashboard:');
        console.error('1. Go to Settings → Upload → Add upload preset');
        console.error('2. Set signing mode to: Unsigned');
        console.error('3. Name it: cogniflow_uploads');
        console.error('4. Save the preset');
      }
      
      if (errorMessage.message.includes('Display name cannot contain slashes')) {
        console.error('\n⚠️ Filename contains slashes or special characters.');
        console.error('The upload should handle this automatically now.');
      }
      
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        url: null,
        publicId: undefined,
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      url: null,
      publicId: undefined,
    });
  }, []);

  return {
    upload,
    uploadState,
    reset,
  };
}

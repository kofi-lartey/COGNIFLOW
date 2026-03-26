// Cloudinary Configuration - Using environment variables
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djjgkezui',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '395663919976528',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cogniflow_uploads',
};

// Validate Cloudinary configuration
export function isCloudinaryConfigured(): boolean {
  return !!(
    CLOUDINARY_CONFIG.cloudName &&
    CLOUDINARY_CONFIG.uploadPreset
  );
}

// TypeScript interfaces for Cloudinary responses
export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  created_at: string;
  id: string;
  name: string;
  path: string;
}

export interface CloudinaryUploadError {
  error: {
    message: string;
  };
}

// Helper functions for Cloudinary URL transformations
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  const transforms: string[] = [];
  
  if (options?.width || options?.height) {
    const w = options.width || 'w';
    const h = options.height || 'h';
    const cropMode = options.crop === 'fill' ? 'fill' : 
                     options.crop === 'thumb' ? 'fill' : 
                     options.crop === 'fit' ? 'fit' : 'scale';
    transforms.push(`${cropMode},w_${w},h_${h}`);
  }
  
  transforms.push('f_auto');
  transforms.push('q_auto');
  
  const transformString = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformString}${publicId}`;
}

// Get thumbnail URL for preview
export function getThumbnailUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_fill,w_150,h_150,f_auto,q_auto/${publicId}`;
}

// Get full-size preview URL
export function getPreviewUrl(publicId: string, maxWidth = 800): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_scale,w_${maxWidth},f_auto,q_auto/${publicId}`;
}

// Get raw file URL (for documents, spreadsheets, etc.)
export function getRawFileUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/${publicId}`;
}

// Get video URL
export function getVideoUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale';
}): string {
  const transforms: string[] = ['f_auto', 'q_auto'];
  
  if (options?.width || options?.height) {
    const cropMode = options.crop || 'scale';
    transforms.push(`${cropMode},w_${options.width || 'w'},h_${options.height || 'h'}`);
  }
  
  const transformString = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/${transformString}${publicId}`;
}

// Check if resource is an image
export function isImage(resourceType: string): boolean {
  return resourceType === 'image';
}

// Check if resource is a video
export function isVideoResource(resourceType: string): boolean {
  return resourceType === 'video';
}

// Check if resource is raw (document, spreadsheet, etc.)
export function isRawResource(resourceType: string): boolean {
  return resourceType === 'raw';
}

// Get file extension from public ID
export function getFileExtension(publicId: string): string {
  const parts = publicId.split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
}

// Get MIME type from Cloudinary format
export function getMimeType(format: string, resourceType: string): string {
  const imageMimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  };

  const documentMimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
    txt: 'text/plain',
  };

  if (resourceType === 'video') {
    return 'video/mp4';
  }

  if (resourceType === 'image') {
    return imageMimeTypes[format] || 'image/jpeg';
  }

  return documentMimeTypes[format] || 'application/octet-stream';
}

// Export configuration for use in other files
export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CONFIG.cloudName,
  apiKey: CLOUDINARY_CONFIG.apiKey,
  uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
};

// Upload endpoint URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;

// Get format from filename
export function getFormatFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ext;
}

// Determine resource type from file
export function getResourceTypeFromFile(file: File): string {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'video'; // Cloudinary treats audio as video
  
  // Also check by extension for Microsoft Word documents
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'raw';
  if (name.endsWith('.pdf')) return 'raw';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'raw';
  if (name.endsWith('.mp3') || name.endsWith('.mp4')) return 'video';
  
  return 'raw';
}

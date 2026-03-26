'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, FileSpreadsheet, Image, Music, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { useFileUpload, type FileUploadState } from '@/hooks/useFileUpload';
import { type CloudinaryUploadResponse } from '@/lib/cloudinary';

export interface FileMetadata {
    name: string;
    type: string;
    size: number;
    url: string;
    publicId?: string;
    resourceType?: string;
}

// Allowed file extensions by category
const ALLOWED_EXTENSIONS = {
    documents: ['pdf', 'doc', 'docx'],
    spreadsheets: ['xlsx', 'csv'],
    images: ['jpeg', 'jpg', 'png', 'gif'],
    media: ['mp3', 'mp4'],
    docs: ['doc', 'docx'], // Legacy format support
};

export interface FileUploaderProps {
    onUploadComplete: (file: FileMetadata) => void;
    maxFileSize?: number; // in bytes
    enabled?: boolean;
}

export default function FileUploader({
    onUploadComplete,
    maxFileSize = 500 * 1024 * 1024, // 500MB default
    enabled = true,
}: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadState, setUploadState] = useState<FileUploadState>({
        uploading: false,
        progress: 0,
        error: null,
        url: null,
        publicId: undefined,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Use the file upload hook at the top level
    const { upload } = useFileUpload();

    // Check if file type is allowed
    const isFileTypeAllowed = (file: File): boolean => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        
        return [
            ...ALLOWED_EXTENSIONS.documents,
            ...ALLOWED_EXTENSIONS.spreadsheets,
            ...ALLOWED_EXTENSIONS.images,
            ...ALLOWED_EXTENSIONS.media,
        ].includes(ext);
    };

    // Check if file size is allowed
    const isFileSizeAllowed = (file: File): boolean => {
        return file.size <= maxFileSize;
    };

    // Get file icon based on type
    const getFileIcon = (type: string) => {
        const ext = type.toLowerCase().split('.').pop() || type.toLowerCase();
        
        if (ALLOWED_EXTENSIONS.documents.includes(ext)) return <FileText size={20} />;
        if (ALLOWED_EXTENSIONS.spreadsheets.includes(ext)) return <FileSpreadsheet size={20} />;
        if (ALLOWED_EXTENSIONS.images.includes(ext)) return <Image size={20} />;
        if (['mp3'].includes(ext)) return <Music size={20} />;
        if (ALLOWED_EXTENSIONS.media.includes(ext)) return <Video size={20} />;
        
        return <FileText size={20} />;
    };

    // Handle file selection
    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0 || !enabled) return;
        
        const file = files[0];
        
        // Validate file type
        if (!isFileTypeAllowed(file)) {
            setUploadState({
                uploading: false,
                progress: 0,
                error: new Error(`File type not allowed. Supported types: PDF, DOC, DOCX, XLSX, CSV, JPEG, JPG, PNG, GIF, MP3, MP4`),
                url: null,
                publicId: undefined,
            });
            return;
        }
        
        // Validate file size
        if (!isFileSizeAllowed(file)) {
            setUploadState({
                uploading: false,
                progress: 0,
                error: new Error(`File size exceeds maximum of ${Math.round(maxFileSize / (1024 * 1024))}MB`),
                url: null,
                publicId: undefined,
            });
            return;
        }

        setSelectedFile(file);
        setUploadState({
            uploading: true,
            progress: 0,
            error: null,
            url: null,
            publicId: undefined,
        });

        try {
            // Upload file to Cloudinary using the hook
            const cloudinaryResponse: CloudinaryUploadResponse | null = await upload(file);

            if (cloudinaryResponse) {
                setUploadState({
                    uploading: false,
                    progress: 100,
                    error: null,
                    url: cloudinaryResponse.secure_url,
                    publicId: cloudinaryResponse.public_id,
                });

                // Pass file metadata to parent including Cloudinary info
                const fileMetadata: FileMetadata = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: cloudinaryResponse.secure_url,
                    publicId: cloudinaryResponse.public_id,
                    resourceType: cloudinaryResponse.resource_type,
                };
                
                onUploadComplete(fileMetadata);
            } else {
                throw new Error('Upload failed - no response returned');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error : new Error('Upload failed');
            setUploadState({
                uploading: false,
                progress: 0,
                error: errorMessage,
                url: null,
                publicId: undefined,
            });
        }
    }, [enabled, maxFileSize, onUploadComplete, upload]);

    // Handle drag events
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    // Handle drop event
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    }, [handleFiles]);

    // Clear error state
    const clearError = useCallback(() => {
        setUploadState({
            uploading: false,
            progress: 0,
            error: null,
            url: null,
            publicId: undefined,
        });
        setSelectedFile(null);
    }, []);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {/* Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer
                    ${dragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-[#1E293B] hover:border-cyan-400/40'}
                    ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${uploadState.uploading ? 'pointer-events-none' : ''}`}
                onClick={() => {
                    if (enabled && !uploadState.uploading && fileInputRef.current) {
                        fileInputRef.current.click();
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={Object.values(ALLOWED_EXTENSIONS).flat().map(ext => `.${ext}`).join(',')}
                    onChange={handleFileInputChange}
                    disabled={!enabled || uploadState.uploading}
                />

                {/* Upload Content */}
                <div className="flex flex-col items-center">
                    <Upload className="mx-auto mb-4 text-cyan-400" size={36} />
                    <h3 className="text-xl font-semibold mb-2">Ingest New Intelligence</h3>
                    <p className="text-[#6B7280] text-sm mb-4">
                        Drop files here or click to browse
                    </p>
                    
                    {/* Supported formats */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <FileTypeBadge type="PDF, DOC, DOCX" />
                        <FileTypeBadge type="XLSX, CSV" />
                        <FileTypeBadge type="JPEG, JPG, PNG, GIF" />
                        <FileTypeBadge type="MP3, MP4" />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#6B7280] px-4 w-full">
                        <span>MAX FILE SIZE: {Math.round(maxFileSize / (1024 * 1024))}MB</span>
                        <span>AES-256 ENCRYPTED</span>
                    </div>
                </div>
            </div>

            {/* Upload Progress / Error */}
            {(uploadState.uploading || uploadState.error) && selectedFile && (
                <div className="mt-4 p-4 bg-[#0D1628] border border-[#1E293B] rounded-xl">
                    {uploadState.uploading && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                                    {getFileIcon(selectedFile.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-[#6B7280]">
                                        {selectedFile.type} • {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                                <div className="text-cyan-400 text-sm">
                                    {uploadState.progress}%
                                </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="h-1 bg-[#020617] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadState.progress}%` }}
                                />
                            </div>
                            
                            <p className="text-xs text-[#6B7280] text-center">
                                Uploading to Cloudinary...
                            </p>
                        </div>
                    )}

                    {uploadState.error && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400">
                                <AlertCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-red-400 font-medium">Upload Failed</p>
                                <p className="text-xs text-[#6B7280]">{uploadState.error.message}</p>
                            </div>
                            <button 
                                onClick={clearError}
                                className="p-2 hover:bg-white/5 rounded-lg transition"
                            >
                                <X size={16} className="text-[#6B7280]" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Complete - show only briefly before redirect */}
            {uploadState.url && !uploadState.uploading && !uploadState.error && selectedFile && (
                <div className="mt-4 p-4 bg-[#0D1628] border border-emerald-400/20 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                            <CheckCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-emerald-400 font-medium">Upload Complete</p>
                            <p className="text-xs text-[#6B7280]">
                                Redirecting to AI Insight options...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// File type badge component
function FileTypeBadge({ type }: { type: string }) {
    return (
        <span className="px-2 py-1 bg-[#0F172A] border border-[#1E293B] rounded text-[10px] text-[#6B7280]">
            {type}
        </span>
    );
}

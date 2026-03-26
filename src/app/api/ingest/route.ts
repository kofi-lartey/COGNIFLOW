/**
 * CogniFlow "Bundle-Light" Ingestor API Route
 * 
 * Downloads files from Cloudinary URLs, detects file type (PDF/Docx),
 * extracts raw text server-side, and returns clean text with neuralStatus.
 * 
 * Architecture: Zero-Lag pipeline - offloads heavy processing to serverless
 */

import { NextRequest, NextResponse } from 'next/server';

// Type definitions for the ingest pipeline
export interface IngestRequest {
  cloudinaryUrl: string;
  fileType?: 'pdf' | 'docx' | 'video' | 'audio' | 'auto';
  options?: {
    extractImages?: boolean;
    maxPages?: number;
    language?: string;
  };
}

export interface IngestResponse {
  success: boolean;
  data?: {
    text: string;
    metadata: {
      fileType: string;
      pageCount?: number;
      wordCount: number;
      charCount: number;
      extractedAt: string;
    };
    neuralStatus: 'VECTORIZING';
  };
  error?: string;
  message?: string;
}

// Neural processing status enum
export type NeuralStatus = 'FETCHING' | 'VECTORIZING' | 'ANALYZING' | 'COMPLETE';

/**
 * Detect file type from Cloudinary URL or content
 */
function detectFileType(url: string, explicitType?: string): string {
  if (explicitType && explicitType !== 'auto') {
    return explicitType;
  }
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('.pdf') || urlLower.includes('format/pdf')) {
    return 'pdf';
  }
  if (urlLower.includes('.docx') || urlLower.includes('format/docx') || 
      urlLower.includes('.doc') || urlLower.includes('format/doc')) {
    return 'docx';
  }
  if (urlLower.includes('.mp4') || urlLower.includes('video/') || 
      urlLower.includes('resource_type/video')) {
    return 'video';
  }
  if (urlLower.includes('.mp3') || urlLower.includes('audio/') || 
      urlLower.includes('resource_type/raw')) {
    return 'audio';
  }
  
  return 'unknown';
}

/**
 * Extract text from PDF using server-side parsing
 * In production, this would use pdf-parse or pdf.js
 */
async function extractFromPDF(buffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  // For server-side PDF parsing, we would use pdf-parse
  // Since we're in a Next.js environment, we'll implement a basic text extractor
  // In production, install: npm install pdf-parse
  
  try {
    // Convert ArrayBuffer to text representation
    // This is a simplified version - real implementation would parse PDF structure
    const bytes = new Uint8Array(buffer);
    const textParts: string[] = [];
    
    // Simple PDF text extraction - look for stream content
    // In production, use proper PDF parsing libraries
    let inStream = false;
    let streamContent = '';
    
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const pdfContent = decoder.decode(bytes);
    
    // Extract text between stream/endstream markers
    const streamMatch = pdfContent.match(/stream\s*([\s\S]*?)endstream/g);
    if (streamMatch) {
      for (const stream of streamMatch) {
        // Clean up the stream content
        const cleanText = stream
          .replace(/stream\s*/g, '')
          .replace(/endstream/g, '')
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')  // Keep printable ASCII
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanText.length > 10) {
          textParts.push(cleanText);
        }
      }
    }
    
    // Count pages from /Type /Page occurrences
    const pageCount = (pdfContent.match(/\/Type\s*\/Page[^s]/g) || []).length || 1;
    
    return {
      text: textParts.join('\n\n').substring(0, 500000), // Limit to 500k chars
      pageCount
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return { text: '', pageCount: 0 };
  }
}

/**
 * Extract text from DOCX using server-side parsing
 */
async function extractFromDOCX(buffer: ArrayBuffer): Promise<{ text: string }> {
  try {
    // DOCX files are ZIP archives containing XML
    // In production, use: npm install mammoth
    
    const bytes = new Uint8Array(buffer);
    const textParts: string[] = [];
    
    // Simple DOCX text extraction - look for w:t (text) elements in XML
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(bytes);
    
    // Extract text from document.xml within the ZIP
    const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches) {
      for (const match of textMatches) {
        const text = match.replace(/<[^>]+>/g, '').trim();
        if (text.length > 0) {
          textParts.push(text);
        }
      }
    }
    
    return {
      text: textParts.join(' ').substring(0, 500000)
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return { text: '' };
  }
}

/**
 * Process video/audio URLs - return metadata for Whisper API processing
 */
function processMediaUrl(url: string): { isMedia: boolean; mediaType: string; duration?: number } {
  // In production, this would call Cloudinary API to get video duration
  return {
    isMedia: true,
    mediaType: url.toLowerCase().includes('.mp3') ? 'audio' : 'video'
  };
}

/**
 * Main POST handler for the ingest API
 */
export async function POST(request: NextRequest): Promise<NextResponse<IngestResponse>> {
  try {
    // Parse request body
    const body: IngestRequest = await request.json();
    const { cloudinaryUrl, fileType: explicitType, options } = body;

    // Validate URL
    if (!cloudinaryUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_URL',
          message: 'Cloudinary URL is required'
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(cloudinaryUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_URL',
          message: 'Invalid Cloudinary URL format'
        },
        { status: 400 }
      );
    }

    // Detect file type
    const fileType = detectFileType(cloudinaryUrl, explicitType);
    
    // Check if it's a media file
    const mediaInfo = processMediaUrl(cloudinaryUrl);
    
    if (mediaInfo.isMedia) {
      // For video/audio, return status for Whisper API processing
      return NextResponse.json({
        success: true,
        data: {
          text: '', // Empty for media - will be filled by Whisper
          metadata: {
            fileType: mediaInfo.mediaType,
            wordCount: 0,
            charCount: 0,
            extractedAt: new Date().toISOString()
          },
          neuralStatus: 'VECTORIZING' as const
        }
      });
    }

    // For documents, download and extract text
    // Convert Cloudinary URL to raw download URL
    const downloadUrl = cloudinaryUrl.includes('/upload/')
      ? cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/')
      : cloudinaryUrl;

    // Fetch the file
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'DOWNLOAD_FAILED',
          message: `Failed to download file: ${response.status} ${response.statusText}`
        },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    
    // Extract text based on file type
    let extractedText = '';
    let pageCount = 1;
    
    switch (fileType) {
      case 'pdf': {
        const pdfResult = await extractFromPDF(buffer);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pageCount;
        break;
      }
      case 'docx': {
        const docxResult = await extractFromDOCX(buffer);
        extractedText = docxResult.text;
        break;
      }
      default:
        // Try to read as plain text
        const decoder = new TextDecoder('utf-8', { fatal: false });
        extractedText = decoder.decode(buffer).substring(0, 500000);
    }

    // Calculate text statistics
    const wordCount = extractedText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = extractedText.length;

    // Return successful response with VECTORIZING status
    return NextResponse.json({
      success: true,
      data: {
        text: extractedText,
        metadata: {
          fileType,
          pageCount: fileType === 'pdf' ? pageCount : undefined,
          wordCount,
          charCount,
          extractedAt: new Date().toISOString()
        },
        neuralStatus: 'VECTORIZING'
      }
    });

  } catch (error) {
    console.error('Ingest API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns API status and capabilities
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'operational',
    service: 'CogniFlow Neural Ingestor',
    version: '1.0.0',
    capabilities: {
      supportedTypes: ['pdf', 'docx', 'video', 'audio'],
      maxFileSize: '50MB',
      processingMode: 'serverless'
    },
    neuralStatus: {
      FETCHING: 'Downloading file from Cloudinary',
      VECTORIZING: 'Extracting and parsing document content',
      ANALYZING: 'Processing with Transformers.js or Whisper API',
      COMPLETE: 'Neural processing complete'
    }
  });
}

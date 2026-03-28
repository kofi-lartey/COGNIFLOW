/**
 * CogniFlow Neural Processor Hook
 * 
 * Provides state management for the neural processing pipeline,
 * connecting to the Command Center and Recent Vault Activity table.
 * 
 * Handles status transitions: FETCHING -> VECTORIZING -> ANALYZING -> COMPLETE
 * 
 * React 19 Compatible:
 * - Uses mountedRef to prevent state updates after unmount
 * - Proper cleanup in useEffect hooks
 * - Disposal mechanism for processor resources
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ProcessorService, type PersonaType, type ContentType, type ProcessingResult } from '@/lib/processor';
import { generateLearningPath, type LearningPath, type LearningDuration } from '@/lib/cogni-scheduler';

// ============================================
// Type Definitions
// ============================================

// Neural processing status
export type NeuralStatus = 'IDLE' | 'FETCHING' | 'VECTORIZING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';

// File item for the dashboard
export interface NeuralFileItem {
  id: string;
  name: string;
  type: ContentType;
  status: NeuralStatus;
  progress: number;
  message: string;
  uploadedAt: string;
  processingTime?: number;
  result?: ProcessingResult;
  learningPath?: LearningPath;
  error?: string;
}

// Processing options
export interface ProcessingOptions {
  persona: PersonaType;
  duration: LearningDuration;
  generateQuiz: boolean;
  generateKeyPoints: boolean;
  generateLearningPath: boolean;
}

// ============================================
// Hook Configuration
// ============================================

const DEFAULT_OPTIONS: ProcessingOptions = {
  persona: 'teen',
  duration: 7,
  generateQuiz: true,
  generateKeyPoints: true,
  generateLearningPath: true
};

// ============================================
// Main Hook
// ============================================

/**
 * useNeuralProcessor - Main hook for neural processing state management
 * 
 * React 19 Compatible:
 * - Proper cleanup in useEffect hooks
 * - mountedRef to prevent state updates after unmount
 * - Disposal mechanism for processor resources
 */
export function useNeuralProcessor() {
  // State
  const [files, setFiles] = useState<NeuralFileItem[]>([]);
  const [currentFile, setCurrentFile] = useState<NeuralFileItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<NeuralStatus>('IDLE');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const processorRef = useRef<ProcessorService | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  
  // Initialize processor (React 19 compatible)
  useEffect(() => {
    mountedRef.current = true;
    
    processorRef.current = new ProcessorService({
      persona: DEFAULT_OPTIONS.persona,
      maxSummaryLength: 150
    });
    
    // Cleanup function (React 19 best practice)
    return () => {
      mountedRef.current = false;
      
      // Terminate processor to prevent memory leaks
      if (processorRef.current) {
        processorRef.current.terminate();
        processorRef.current = null;
      }
      
      // Abort any ongoing processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);
  
  // ============================================
  // File Management
  // ============================================
  
  /**
   * Add a new file to process
   */
  const addFile = useCallback((name: string, type: ContentType, cloudinaryUrl?: string): string => {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newFile: NeuralFileItem = {
      id,
      name,
      type,
      status: 'IDLE',
      progress: 0,
      message: 'Ready to process',
      uploadedAt: new Date().toISOString()
    };
    
    if (mountedRef.current) {
      setFiles(prev => [newFile, ...prev]);
    }
    return id;
  }, []);
  
  /**
   * Update file status
   */
  const updateFileStatus = useCallback((
    fileId: string,
    updates: Partial<NeuralFileItem>
  ) => {
    if (mountedRef.current) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, ...updates } : f
      ));
    }
  }, []);
  
  /**
   * Remove a file
   */
  const removeFile = useCallback((fileId: string) => {
    if (mountedRef.current) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  }, []);
  
  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    if (mountedRef.current) {
      setFiles([]);
      setCurrentFile(null);
    }
  }, []);
  
  // ============================================
  // Processing Pipeline
  // ============================================
  
  /**
   * Process a file through the neural pipeline
   */
  const processFile = useCallback(async (
    fileId: string,
    content: string,
    options: Partial<ProcessingOptions> = {}
  ) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Create abort controller for this processing session
    abortControllerRef.current = new AbortController();
    
    if (mountedRef.current) {
      setIsProcessing(true);
      setCurrentFile(file);
      setError(null);
    }
    
    // Update processor config
    processorRef.current?.updateConfig({ persona: mergedOptions.persona });
    
    try {
      // Stage 1: FETCHING
      if (mountedRef.current) {
        setStatus('FETCHING');
        setProgress(10);
        setMessage('Fetching content from Vault...');
      }
      updateFileStatus(fileId, { status: 'FETCHING', progress: 10, message: 'Fetching content...' });
      
      // Simulate fetch delay (with abort check)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 500);
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Processing aborted'));
        });
      });
      
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Processing aborted');
      }
      
      // Stage 2: VECTORIZING
      if (mountedRef.current) {
        setStatus('VECTORIZING');
        setProgress(30);
        setMessage('Extracting and vectorizing text...');
      }
      updateFileStatus(fileId, { status: 'VECTORIZING', progress: 30, message: 'Vectorizing content...' });
      
      // Call ingest API
      const ingestResponse = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryUrl: content,
          fileType: file.type
        }),
        signal: abortControllerRef.current?.signal
      });
      
      if (!ingestResponse.ok) {
        throw new Error('Failed to ingest content');
      }
      
      const ingestData = await ingestResponse.json();
      
      if (!ingestData.success) {
        throw new Error(ingestData.message || 'Ingest failed');
      }
      
      // Stage 3: ANALYZING
      if (mountedRef.current) {
        setStatus('ANALYZING');
        setProgress(50);
        setMessage('Analyzing with Neural Engine...');
      }
      updateFileStatus(fileId, { status: 'ANALYZING', progress: 50, message: 'Analyzing content...' });
      
      // Process with local worker
      const result = await processorRef.current!.process(
        ingestData.data?.text || content,
        file.type,
        (status, prog, msg) => {
          if (!mountedRef.current) return;
          
          const adjustedProgress = 50 + prog * 0.4;
          setProgress(adjustedProgress);
          setMessage(msg);
          updateFileStatus(fileId, { 
            status: status as NeuralStatus, 
            progress: adjustedProgress, 
            message: msg 
          });
        }
      );
      
      // Stage 4: COMPLETE
      if (mountedRef.current) {
        setStatus('COMPLETE');
        setProgress(100);
        setMessage('Neural processing complete!');
      }
      updateFileStatus(fileId, { 
        status: 'COMPLETE', 
        progress: 100, 
        message: 'Processing complete',
        result,
        processingTime: result.processingTime
      });
      
      // Generate learning path if requested
      let learningPath: LearningPath | undefined;
      if (mergedOptions.generateLearningPath) {
        learningPath = generateLearningPath(
          file.name,
          result.summary,
          result.keyPoints,
          mergedOptions.duration
        );
        updateFileStatus(fileId, { learningPath });
      }
      
      if (mountedRef.current) {
        setCurrentFile(prev => prev ? {
          ...prev,
          status: 'COMPLETE',
          progress: 100,
          result,
          learningPath
        } : null);
      }
      
    } catch (err) {
      // Check if error is due to abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      if (mountedRef.current) {
        setStatus('ERROR');
        setError(errorMessage);
      }
      updateFileStatus(fileId, { 
        status: 'ERROR', 
        error: errorMessage,
        message: errorMessage
      });
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false);
      }
      abortControllerRef.current = null;
    }
  }, [files, updateFileStatus]);
  
  /**
   * Cancel current processing
   */
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    processorRef.current?.terminate();
    
    if (mountedRef.current) {
      setIsProcessing(false);
      setStatus('IDLE');
      setProgress(0);
      setMessage('');
    }
    
    if (currentFile) {
      updateFileStatus(currentFile.id, { 
        status: 'IDLE', 
        progress: 0, 
        message: 'Processing cancelled' 
      });
    }
  }, [currentFile, updateFileStatus]);
  
  // ============================================
  // Status Helpers
  // ============================================
  
  /**
   * Get status color for UI
   */
  const getStatusColor = useCallback((fileStatus: NeuralStatus): string => {
    switch (fileStatus) {
      case 'IDLE':
        return 'text-gray-400';
      case 'FETCHING':
        return 'text-blue-400';
      case 'VECTORIZING':
        return 'text-cyan-400';
      case 'ANALYZING':
        return 'text-purple-400';
      case 'COMPLETE':
        return 'text-green-400';
      case 'ERROR':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }, []);
  
  /**
   * Get status icon
   */
  const getStatusIcon = useCallback((fileStatus: NeuralStatus): string => {
    switch (fileStatus) {
      case 'IDLE':
        return '○';
      case 'FETCHING':
        return '↓';
      case 'VECTORIZING':
        return '◈';
      case 'ANALYZING':
        return '⚡';
      case 'COMPLETE':
        return '✓';
      case 'ERROR':
        return '✕';
      default:
        return '○';
    }
  }, []);
  
  /**
   * Get progress bar color
   */
  const getProgressColor = useCallback((fileStatus: NeuralStatus): string => {
    switch (fileStatus) {
      case 'IDLE':
        return 'bg-gray-600';
      case 'FETCHING':
        return 'bg-blue-500';
      case 'VECTORIZING':
        return 'bg-cyan-500';
      case 'ANALYZING':
        return 'bg-purple-500';
      case 'COMPLETE':
        return 'bg-green-500';
      case 'ERROR':
        return 'bg-red-500';
      default:
        return 'bg-gray-600';
    }
  }, []);
  
  // ============================================
  // Return State and Functions
  // ============================================
  
  return {
    // State
    files,
    currentFile,
    isProcessing,
    status,
    progress,
    message,
    error,
    
    // File management
    addFile,
    updateFileStatus,
    removeFile,
    clearFiles,
    
    // Processing
    processFile,
    cancelProcessing,
    
    // Helpers
    getStatusColor,
    getStatusIcon,
    getProgressColor
  };
}

export default useNeuralProcessor;

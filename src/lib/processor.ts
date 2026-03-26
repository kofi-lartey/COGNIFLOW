/**
 * CogniFlow Adaptive Intelligence Layer - ProcessorService
 * 
 * Provides the Age-Adaptive Engine that wraps summaries in personas:
 * - Kid (simple, fun language)
 * - Teen (relatable, engaging)
 * - Expert (technical, detailed)
 * 
 * Also handles toggling between local Transformers.js and external Whisper API
 * for video/audio transcription.
 */

import type { WorkerResponse } from '@/workers/engine.worker';

// ============================================
// Type Definitions
// ============================================

// Age-adaptive persona types
export type PersonaType = 'kid' | 'teen' | 'expert';

// Processing mode
export type ProcessingMode = 'local' | 'whisper';

// Content types
export type ContentType = 'pdf' | 'docx' | 'video' | 'audio' | 'text';

// Neural status for UI
export type NeuralStatus = 'FETCHING' | 'VECTORIZING' | 'ANALYZING' | 'COMPLETE';

// Processor configuration
export interface ProcessorConfig {
  persona: PersonaType;
  mode: ProcessingMode;
  maxSummaryLength: number;
  enableQuiz: boolean;
  enableKeyPoints: boolean;
}

// Processing result
export interface ProcessingResult {
  summary: string;
  keyPoints: string[];
  quiz?: QuizQuestion[];
  persona: PersonaType;
  processingTime: number;
  mode: ProcessingMode;
}

// Quiz question type
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Whisper API response
export interface WhisperTranscription {
  text: string;
  language: string;
  duration?: number;
}

// ============================================
// Age-Adaptive Engine - Persona Wrappers
// ============================================

/**
 * Transform summary based on persona type
 */
function applyPersona(summary: string, persona: PersonaType, keyPoints: string[]): {
  transformedSummary: string;
  transformedKeyPoints: string[];
} {
  switch (persona) {
    case 'kid':
      return transformForKid(summary, keyPoints);
    case 'teen':
      return transformForTeen(summary, keyPoints);
    case 'expert':
      return transformForExpert(summary, keyPoints);
    default:
      return { transformedSummary: summary, transformedKeyPoints: keyPoints };
  }
}

/**
 * Kid persona - Simple, fun, engaging language
 */
function transformForKid(summary: string, keyPoints: string[]): {
  transformedSummary: string;
  transformedKeyPoints: string[];
} {
  // Simplify vocabulary
  const kidSummary = summary
    .replace(/utilize/g, 'use')
    .replace(/implement/g, 'do')
    .replace(/facilitate/g, 'help')
    .replace(/subsequently/g, 'then')
    .replace(/approximately/g, 'about')
    .replace(/demonstrate/g, 'show')
    .replace(/establish/g, 'set up')
    .replace(/commence/g, 'start')
    .replace(/terminate/g, 'end')
    .replace(/nevertheless/g, 'but')
    .replace(/furthermore/g, 'also')
    .replace(/consequently/g, 'so')
    .replace(/methodology/g, 'way')
    .replace(/functionality/g, 'features')
    .replace(/comprehensive/g, 'complete')
    .replace(/substantial/g, 'big')
    .replace(/numerous/g, 'many')
    .replace(/additional/g, 'more')
    .replace(/approximately/g, 'about');
  
  // Add friendly intro
  const intro = "🌟 Hey there! Here's the cool stuff you need to know:\n\n";
  const outro = "\n\n🎉 Pretty neat, right?";
  
  // Simplify key points
  const kidPoints = keyPoints.map(point => {
    let simplified = point
      .replace(/[^\w\s.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Make it more conversational
    if (!simplified.endsWith('!') && !simplified.endsWith('?')) {
      simplified += '!';
    }
    
    return `• ${simplified}`;
  });
  
  return {
    transformedSummary: intro + kidSummary + outro,
    transformedKeyPoints: kidPoints
  };
}

/**
 * Teen persona - Relatable, engaging, modern language
 */
function transformForTeen(summary: string, keyPoints: string[]): {
  transformedSummary: string;
  transformedKeyPoints: string[];
} {
  // Add trendy intro
  const intro = "🔥 TL;DR - Here's the tea on this:\n\n";
  const outro = "\n\n💡 Bottom line: This is def worth knowing about!";
  
  // Add some emoji and modern phrases
  const teenSummary = summary
    .replace(/(important|crucial|essential)/gi, '💎 key')
    .replace(/(learn|understand)/gi, 'get')
    .replace(/(information|data)/gi, 'info')
    .replace(/(problem|issue)/gi, 'thing to know');
  
  // Make key points more engaging
  const teenPoints = keyPoints.map((point, index) => {
    const emojis = ['🎯', '💡', '⚡', '🚀', '📌'];
    return `${emojis[index % emojis.length]} ${point}`;
  });
  
  return {
    transformedSummary: intro + teenSummary + outro,
    transformedKeyPoints: teenPoints
  };
}

/**
 * Expert persona - Technical, detailed, professional
 */
function transformForExpert(summary: string, keyPoints: string[]): {
  transformedSummary: string;
  transformedKeyPoints: string[];
} {
  // Add technical intro
  const intro = "📊 Executive Summary:\n\n";
  const outro = "\n\n📋 Technical Implications: See attached documentation.";
  
  // Enhance with technical language
  const expertSummary = summary
    .replace(/\b(the|a|an)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Add technical formatting to key points
  const expertPoints = keyPoints.map((point, index) => {
    return `[${index + 1}] ${point}`;
  });
  
  return {
    transformedSummary: intro + expertSummary + outro,
    transformedKeyPoints: expertPoints
  };
}

// ============================================
// Whisper API Integration
// ============================================

/**
 * Transcribe video/audio using Whisper API
 */
export async function transcribeWithWhisper(
  audioUrl: string,
  onProgress?: (progress: number) => void
): Promise<WhisperTranscription> {
  const WHISPER_API_URL = process.env.NEXT_PUBLIC_WHISPER_API_URL || '/api/whisper';
  
  try {
    onProgress?.(0);
    
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl,
        language: 'auto',
        task: 'transcribe'
      })
    });
    
    onProgress?.(50);
    
    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }
    
    const result = await response.json();
    onProgress?.(100);
    
    return {
      text: result.text || '',
      language: result.language || 'en',
      duration: result.duration
    };
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    throw error;
  }
}

// ============================================
// Processing Mode Detection
// ============================================

/**
 * Determine whether to use local or Whisper API processing
 */
export function determineProcessingMode(
  contentType: ContentType,
  contentLength: number
): ProcessingMode {
  // Use Whisper API for video/audio
  if (contentType === 'video' || contentType === 'audio') {
    return 'whisper';
  }
  
  // Use local processing for text documents under 100k chars
  if (contentType === 'pdf' || contentType === 'docx' || contentType === 'text') {
    if (contentLength < 100000) {
      return 'local';
    }
    // For very large documents, could use Whisper API
    return 'local';
  }
  
  return 'local';
}

// ============================================
// Main Processor Service
// ============================================

/**
 * ProcessorService - Main class for adaptive intelligence processing
 */
export class ProcessorService {
  private worker: Worker | null = null;
  private config: ProcessorConfig;
  private isInitialized: boolean = false;
  
  constructor(config: Partial<ProcessorConfig> = {}) {
    this.config = {
      persona: config.persona || 'teen',
      mode: config.mode || 'local',
      maxSummaryLength: config.maxSummaryLength || 150,
      enableQuiz: config.enableQuiz ?? true,
      enableKeyPoints: config.enableKeyPoints ?? true
    };
  }
  
  /**
   * Initialize the processor with Web Worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve, reject) => {
      try {
        // Create worker
        this.worker = new Worker(
          new URL('@/workers/engine.worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        // Wait for initialization
        this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          if (event.data.type === 'INIT_COMPLETE') {
            this.isInitialized = true;
            resolve();
          } else if (event.data.type === 'ERROR') {
            reject(new Error(event.data.error));
          }
        };
        
        this.worker.onerror = (error) => {
          reject(error);
        };
        
        // Send init message
        this.worker.postMessage({ type: 'INIT' });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Process content with adaptive intelligence
   */
  async process(
    content: string,
    contentType: ContentType,
    onProgress?: (status: NeuralStatus, progress: number, message: string) => void
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    // Determine processing mode
    const mode = determineProcessingMode(contentType, content.length);
    
    onProgress?.('FETCHING', 10, 'Content received');
    
    // For video/audio, use Whisper API
    if (mode === 'whisper') {
      onProgress?.('VECTORIZING', 30, 'Transcribing with Whisper API...');
      
      try {
        const transcription = await transcribeWithWhisper(content, (progress) => {
          onProgress?.('VECTORIZING', 30 + progress * 0.3, `Transcribing: ${progress}%`);
        });
        
        content = transcription.text;
      } catch (error) {
        console.error('Whisper transcription failed, using local fallback:', error);
        // Fall back to local processing
      }
    }
    
    onProgress?.('VECTORIZING', 50, 'Text extracted and vectorized');
    
    // Process with local worker
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }
      
      let summary = '';
      let keyPoints: string[] = [];
      
      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        const { type, progress, message, data, error } = event.data;
        
        if (type === 'ERROR') {
          this.worker?.removeEventListener('message', handleMessage);
          reject(new Error(error || 'Processing failed'));
          return;
        }
        
        if (type === 'PROGRESS') {
          const adjustedProgress = 50 + progress * 0.4;
          onProgress?.('ANALYZING', adjustedProgress, message);
        }
        
        if (type === 'SUCCESS') {
          this.worker?.removeEventListener('message', handleMessage);
          
          // Extract results based on what was processed
          if (data?.summary) {
            summary = data.summary;
          }
          if (data?.keyPoints) {
            keyPoints = data.keyPoints;
          }
          
          onProgress?.('COMPLETE', 100, 'Processing complete');
          
          // Apply persona transformation
          const { transformedSummary, transformedKeyPoints } = applyPersona(
            summary || content.substring(0, 200),
            this.config.persona,
            keyPoints
          );
          
          resolve({
            summary: transformedSummary,
            keyPoints: transformedKeyPoints,
            persona: this.config.persona,
            processingTime: Date.now() - startTime,
            mode
          });
        }
      };
      
      this.worker.addEventListener('message', handleMessage);
      
      // Send summarization request
      this.worker.postMessage({
        type: 'SUMMARIZE',
        payload: {
          text: content,
          maxLength: this.config.maxSummaryLength
        },
        id: `process-${Date.now()}`
      });
    });
  }
  
  /**
   * Update processor configuration
   */
  updateConfig(config: Partial<ProcessorConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current configuration
   */
  getConfig(): ProcessorConfig {
    return { ...this.config };
  }
  
  /**
   * Terminate the worker
   */
  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.isInitialized = false;
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create a processor with kid persona
 */
export function createKidProcessor(): ProcessorService {
  return new ProcessorService({ persona: 'kid' });
}

/**
 * Create a processor with teen persona
 */
export function createTeenProcessor(): ProcessorService {
  return new ProcessorService({ persona: 'teen' });
}

/**
 * Create a processor with expert persona
 */
export function createExpertProcessor(): ProcessorService {
  return new ProcessorService({ persona: 'expert' });
}

/**
 * Create a processor based on user age group
 */
export function createAgeAdaptiveProcessor(ageGroup: 'child' | 'teen' | 'adult' | 'senior'): ProcessorService {
  const personaMap: Record<string, PersonaType> = {
    child: 'kid',
    teen: 'teen',
    adult: 'expert',
    senior: 'expert'
  };
  
  return new ProcessorService({ persona: personaMap[ageGroup] || 'teen' });
}

export default ProcessorService;

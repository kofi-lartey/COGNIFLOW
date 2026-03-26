/**
 * CogniFlow AI Insight API
 * 
 * RAG (Retrieval-Augmented Generation) implementation for the AI Insight feature.
 * Provides:
 * - Context injection from vault documents
 * - Source Citations with Cloudinary filename badges
 * - Vector Analysis for multi-dimensional answers
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Type Definitions
// ============================================

interface RAGQuery {
  question: string;
  context?: string;
  maxSources?: number;
}

interface SourceCitation {
  source: string;
  filename: string;
  relevance: number;
  excerpt: string;
}

interface VectorAnalysis {
  vectors: Array<{
    name: string;
    score: number;
    description: string;
  }>;
  primaryVector: string;
}

interface AIInsightResponse {
  success: boolean;
  data?: {
    answer: string;
    sources: SourceCitation[];
    vectorAnalysis: VectorAnalysis;
    confidence: number;
  };
  error?: string;
  message?: string;
}

// ============================================
// Vector Categories for Analysis
// ============================================

const VECTOR_CATEGORIES = [
  { name: 'Scientific', keywords: ['physics', 'chemistry', 'biology', 'math', 'theory', 'experiment', 'hypothesis'] },
  { name: 'Economic', keywords: ['market', 'price', 'cost', 'revenue', 'profit', 'investment', 'economy', 'financial'] },
  { name: 'Technical', keywords: ['software', 'hardware', 'code', 'algorithm', 'system', 'network', 'database', 'api'] },
  { name: 'Historical', keywords: ['history', 'timeline', 'century', 'year', 'era', 'ancient', 'modern', 'past'] },
  { name: 'Philosophical', keywords: ['ethics', 'morality', 'meaning', 'existence', 'thought', 'concept', 'idea'] },
  { name: 'Biological', keywords: ['cell', 'organ', 'dna', 'gene', 'protein', 'organism', 'life', 'health'] }
];

// ============================================
// In-Memory Document Store (Production: use database)
// ============================================

interface DocumentChunk {
  id: string;
  content: string;
  filename: string;
  embeddings?: number[];
}

const documentStore: DocumentChunk[] = [];

// ============================================
// Helper Functions
// ============================================

/**
 * Extract keywords from question for retrieval
 */
function extractKeywords(question: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those'
  ]);

  return question
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Calculate text similarity (simple word overlap)
 */
function calculateSimilarity(query: string, document: string): number {
  const queryWords = new Set(extractKeywords(query));
  const docWords = new Set(document.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  let overlap = 0;
  queryWords.forEach(word => {
    if (docWords.has(word)) overlap++;
  });
  
  return queryWords.size > 0 ? overlap / queryWords.size : 0;
}

/**
 * Identify vectors in the content
 */
function analyzeVectors(content: string): VectorAnalysis {
  const contentLower = content.toLowerCase();
  
  const vectors = VECTOR_CATEGORIES.map(category => {
    const matches = category.keywords.filter(keyword => contentLower.includes(keyword));
    const score = matches.length / category.keywords.length;
    return {
      name: category.name,
      score: Math.min(1, score * 2),
      description: `Found ${matches.length} related terms in ${category.name.toLowerCase()} context`
    };
  }).sort((a, b) => b.score - a.score);
  
  return {
    vectors,
    primaryVector: vectors[0]?.name || 'General'
  };
}

/**
 * Extract relevant excerpt from document
 */
function extractExcerpt(content: string, query: string, maxLength: number = 200): string {
  const keywords = extractKeywords(query);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Find sentence with most keyword matches
  let bestSentence = sentences[0] || content.substring(0, maxLength);
  let bestScore = 0;
  
  for (const sentence of sentences) {
    const score = keywords.filter(kw => sentence.toLowerCase().includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }
  
  return bestSentence.trim().substring(0, maxLength) + (bestSentence.length > maxLength ? '...' : '');
}

/**
 * Generate answer from retrieved context (simple extraction - production would use LLM)
 */
function generateAnswer(question: string, sources: SourceCitation[]): string {
  if (sources.length === 0) {
    return "I don't have enough context to answer this question. Please upload more documents to your vault.";
  }
  
  // Simple answer construction from sources
  const primarySource = sources[0];
  const answer = `Based on the documents in your vault, particularly "${primarySource.filename}": ${primarySource.excerpt}`;
  
  // Add secondary information if available
  if (sources.length > 1) {
    const additionalInfo = sources.slice(1).map(s => `Related information from ${s.filename}: ${s.excerpt.substring(0, 100)}...`).join(' ');
    return answer + ' ' + additionalInfo;
  }
  
  return answer;
}

// ============================================
// API Route Handlers
// ============================================

/**
 * POST - Query the AI Insight system
 */
export async function POST(request: NextRequest): Promise<NextResponse<AIInsightResponse>> {
  try {
    const body: RAGQuery = await request.json();
    const { question, context, maxSources = 3 } = body;

    // Validate question
    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_QUESTION',
          message: 'Question is required'
        },
        { status: 400 }
      );
    }

    sendProgress(10, 'Analyzing question...');

    // Retrieve relevant documents from store
    let relevantDocs = documentStore;
    
    // If external context provided, add to search
    if (context) {
      relevantDocs.push({
        id: 'external-context',
        content: context,
        filename: 'Provided Context'
      });
    }

    sendProgress(30, 'Retrieving relevant documents...');

    // Score and rank documents
    const scoredDocs = relevantDocs.map(doc => ({
      ...doc,
      relevance: calculateSimilarity(question, doc.content)
    })).filter(doc => doc.relevance > 0);

    sendProgress(50, 'Analyzing content vectors...');

    // Sort by relevance and take top documents
    const topDocs = scoredDocs
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSources);

    // Generate source citations
    const sources: SourceCitation[] = topDocs.map(doc => ({
      source: doc.id,
      filename: doc.filename,
      relevance: doc.relevance,
      excerpt: extractExcerpt(doc.content, question)
    }));

    sendProgress(70, 'Identifying vector categories...');

    // Analyze vectors from all retrieved content
    const combinedContent = topDocs.map(d => d.content).join(' ');
    const vectorAnalysis = analyzeVectors(combinedContent);

    sendProgress(90, 'Generating answer...');

    // Generate answer from context
    const answer = generateAnswer(question, sources);

    // Calculate confidence based on source relevance
    const confidence = topDocs.length > 0
      ? topDocs.reduce((sum, doc) => sum + doc.relevance, 0) / topDocs.length
      : 0;

    sendProgress(100, 'Complete');

    return NextResponse.json({
      success: true,
      data: {
        answer,
        sources,
        vectorAnalysis,
        confidence: Math.round(confidence * 100)
      }
    });

  } catch (error) {
    console.error('AI Insight API error:', error);
    
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
 * PUT - Add document to vault for RAG
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, content, filename } = body;

    if (!id || !content || !filename) {
      return NextResponse.json(
        { success: false, error: 'MISSING_FIELDS', message: 'ID, content, and filename are required' },
        { status: 400 }
      );
    }

    // Add to document store
    documentStore.push({
      id,
      content,
      filename
    });

    return NextResponse.json({
      success: true,
      message: `Document "${filename}" added to vault`,
      documentCount: documentStore.length
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to add document' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get vault status and statistics
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'operational',
    service: 'CogniFlow AI Insight Engine',
    version: '1.0.0',
    vectorCategories: VECTOR_CATEGORIES.map(v => v.name),
    documentCount: documentStore.length,
    capabilities: {
      rag: true,
      sourceCitations: true,
      vectorAnalysis: true,
      maxSources: 5
    }
  });
}

// Helper to send progress (mock for server-side)
function sendProgress(progress: number, message: string): void {
  console.log(`[AI Insight] ${progress}% - ${message}`);
}
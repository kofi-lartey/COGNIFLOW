/**
 * CogniFlow AI Worker
 * 
 * Web Worker for local Transformers.js processing
 * Acts as a failsafe when cloud APIs are unavailable
 * 
 * Model: Xenova/distilbart-cnn-6-6 (~100MB)
 * Features:
 * - Progress tracking for model download
 * - Local summarization and quiz generation
 * - Automatic fallback from cloud failures
 */

// Import Transformers.js (will be loaded dynamically)
let pipeline = null;
let summarizer = null;
let isModelLoaded = false;
let modelLoadProgress = 0;

/**
 * Cultural Context Templates (mirrored from backend)
 */
const CULTURAL_CONTEXTS = {
  Ghana: {
    transport: 'Trotros',
    fabric: 'Kente',
    market: 'Makola Market',
    addressing: 'Digital Address System',
    tech_hub: 'Accra Digital Centre',
    currency: 'Cedis',
    food: 'Banku and Tilapia',
    festival: 'Homowo Festival'
  },
  UK: {
    transport: 'The Tube',
    fabric: 'Tartan',
    market: 'Borough Market',
    addressing: 'Postcode System',
    tech_hub: 'Silicon Roundabout',
    currency: 'Pounds',
    food: 'Fish and Chips',
    festival: 'Notting Hill Carnival'
  },
  USA: {
    transport: 'Subway',
    fabric: 'Denim',
    market: 'Farmers Market',
    addressing: 'ZIP Code',
    tech_hub: 'Silicon Valley',
    currency: 'Dollars',
    food: 'Burgers',
    festival: 'Thanksgiving'
  },
  International: {
    transport: 'High-speed rail',
    fabric: 'Global textiles',
    market: 'Global Supply Chains',
    addressing: 'GPS Coordinates',
    tech_hub: 'Silicon Valley',
    currency: 'Digital Currency',
    food: 'Fusion Cuisine',
    festival: 'Global Celebrations'
  }
};

/**
 * Initialize the Transformers.js pipeline
 */
async function initializeModel() {
  if (isModelLoaded) {
    return;
  }

  try {
    // Dynamically import Transformers.js
    const { pipeline: transformersPipeline } = await import('@xenova/transformers');
    pipeline = transformersPipeline;

    // Load the summarization model with progress tracking
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
      progress_callback: (progress) => {
        modelLoadProgress = progress.progress || 0;
        self.postMessage({
          type: 'PROGRESS',
          progress: modelLoadProgress,
          status: progress.status || 'loading'
        });
      }
    });

    isModelLoaded = true;
    self.postMessage({
      type: 'MODEL_LOADED',
      status: 'ready'
    });

  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: `Failed to load model: ${error.message}`
    });
    throw error;
  }
}

/**
 * Generate a summary using local Transformers.js
 */
async function generateSummary(text, maxLength = 150) {
  if (!isModelLoaded) {
    throw new Error('Model not loaded');
  }

  const result = await summarizer(text, {
    max_length: maxLength,
    min_length: 30,
    do_sample: false
  });

  return result[0].summary_text;
}

/**
 * Generate quiz questions from text
 */
function generateQuizFromText(text, location) {
  const context = CULTURAL_CONTEXTS[location] || CULTURAL_CONTEXTS.International;
  
  // Extract key sentences for quiz generation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keySentences = sentences.slice(0, 3);
  
  const quiz = keySentences.map((sentence, index) => {
    const words = sentence.trim().split(/\s+/);
    const keyWord = words.find(w => w.length > 5) || words[0];
    
    return {
      question: `What is the significance of "${keyWord}" in the context of ${location}?`,
      options: [
        `It relates to ${context.transport} systems`,
        `It connects to ${context.market} dynamics`,
        `It involves ${context.tech_hub} innovation`,
        `It uses ${context.addressing} principles`
      ],
      correctAnswer: index % 4
    };
  });

  // Ensure we have exactly 3 questions
  while (quiz.length < 3) {
    quiz.push({
      question: `How does this concept apply to ${location}?`,
      options: [
        `Through ${context.transport} networks`,
        `Via ${context.market} strategies`,
        `Using ${context.tech_hub} methods`,
        `With ${context.addressing} systems`
      ],
      correctAnswer: quiz.length % 4
    });
  }

  return quiz.slice(0, 3);
}

/**
 * Generate study scheme based on text
 */
function generateStudyScheme(text, location) {
  const context = CULTURAL_CONTEXTS[location] || CULTURAL_CONTEXTS.International;
  
  return {
    week1: `Review the document and identify key technical terms. Relate them to ${context.tech_hub} concepts.`,
    week2: `Create mind maps connecting the main ideas. Use ${context.fabric} patterns as a visual metaphor for interconnected systems.`,
    week3: `Practice explaining concepts using ${context.food} preparation as an analogy for process workflows.`,
    week4: `Apply the knowledge to a real-world scenario in ${location}. Consider how ${context.addressing} systems could be used.`
  };
}

/**
 * Process content locally using Transformers.js
 */
async function processLocally(text, location) {
  try {
    // Generate summary
    const summary = await generateSummary(text, 200);
    
    // Generate vivid lesson from summary
    const context = CULTURAL_CONTEXTS[location] || CULTURAL_CONTEXTS.International;
    const vividLesson = `This document has been processed locally using AI. The core concepts can be understood through the lens of ${context.transport} systems and ${context.market} dynamics in ${location}. ${summary} This knowledge can be applied to real-world scenarios in ${location}, considering how ${context.addressing} systems and ${context.tech_hub} innovation shape the local landscape.`;
    
    // Generate quiz
    const quiz = generateQuizFromText(text, location);
    
    // Generate study scheme
    const studyScheme = generateStudyScheme(text, location);
    
    return {
      vividLesson,
      quiz,
      studyScheme,
      metadata: {
        location,
        cultureApplied: true,
        providerUsed: 'transformers_js',
        model: 'Xenova/distilbart-cnn-6-6',
        localProcessing: true
      }
    };
    
  } catch (error) {
    throw new Error(`Local processing failed: ${error.message}`);
  }
}

/**
 * Handle messages from main thread
 */
self.onmessage = async (event) => {
  const { type, text, location, id } = event.data;
  
  try {
    switch (type) {
      case 'INITIALIZE':
        await initializeModel();
        break;
        
      case 'PROCESS':
        if (!isModelLoaded) {
          self.postMessage({
            type: 'ERROR',
            id,
            error: 'Model not loaded. Please wait for initialization.'
          });
          return;
        }
        
        const result = await processLocally(text, location);
        self.postMessage({
          type: 'RESULT',
          id,
          result
        });
        break;
        
      case 'CHECK_STATUS':
        self.postMessage({
          type: 'STATUS',
          isLoaded: isModelLoaded,
          progress: modelLoadProgress
        });
        break;
        
      default:
        self.postMessage({
          type: 'ERROR',
          id,
          error: `Unknown message type: ${type}`
        });
    }
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message
    });
  }
};

// Notify that worker is ready
self.postMessage({
  type: 'WORKER_READY',
  status: 'initialized'
});

/**
 * CogniFlow Cogni-Scheduler Logic
 * 
 * Calculates 3-Day or 7-Day Learning Paths and divides extracted intelligence
 * into "Neural Nodes" (milestones) based on content density.
 * 
 * Uses semantic analysis to determine:
 * - Content complexity
 * - Optimal node distribution
 * - Daily learning objectives
 * - Progress tracking metrics
 */

// ============================================
// Type Definitions
// ============================================

// Learning path duration options
export type LearningDuration = 3 | 7;

// Neural Node (milestone) structure
export interface NeuralNode {
  id: string;
  title: string;
  description: string;
  content: string;
  keyPoints: string[];
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  resources: string[];
  quizQuestions?: string[];
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

// Day structure in learning path
export interface LearningDay {
  day: number;
  date: string;
  nodes: NeuralNode[];
  totalMinutes: number;
  objectives: string[];
  status: 'locked' | 'available' | 'completed';
}

// Complete learning path
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: LearningDuration;
  days: LearningDay[];
  createdAt: string;
  updatedAt: string;
  progress: number;
  contentDensity: number;
  estimatedTotalMinutes: number;
}

// Content analysis result
export interface ContentAnalysis {
  complexity: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  keyPointCount: number;
  suggestedNodes: number;
  estimatedReadTime: number;
  topics: string[];
}

// ============================================
// Content Analysis Functions
// ============================================

/**
 * Analyze content to determine complexity and structure
 */
export function analyzeContent(
  text: string,
  keyPoints: string[]
): ContentAnalysis {
  // Basic metrics
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphCount = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  
  // Calculate complexity based on various factors
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgParagraphLength = paragraphCount > 0 ? wordCount / paragraphCount : 0;
  
  // Determine complexity score (0-100)
  let complexity = 50; // Base complexity
  
  // Adjust based on content characteristics
  if (avgWordsPerSentence > 20) complexity += 15;
  if (avgWordsPerSentence < 10) complexity -= 10;
  if (avgParagraphLength > 200) complexity += 10;
  if (keyPoints.length > 10) complexity += 10;
  if (keyPoints.length < 3) complexity -= 10;
  
  // Check for technical terms (capitalized words, acronyms)
  const technicalTerms = text.match(/[A-Z][a-z]+(?=\s[A-Z])|[A-Z]{2,}/g);
  if (technicalTerms && technicalTerms.length > 5) complexity += 10;
  
  // Clamp complexity
  complexity = Math.max(10, Math.min(100, complexity));
  
  // Extract topics from key points
  const topics = keyPoints.map(kp => {
    // Extract first significant noun phrase
    const words = kp.split(/\s+/);
    if (words.length > 0) {
      return words.slice(0, 3).join(' ');
    }
    return kp;
  });
  
  // Calculate suggested nodes based on content density
  const suggestedNodes = Math.max(
    3,
    Math.min(
      15,
      Math.ceil(complexity / 10) + Math.ceil(keyPoints.length / 3)
    )
  );
  
  // Estimate read time (average 200 words per minute)
  const estimatedReadTime = Math.ceil(wordCount / 200);
  
  return {
    complexity,
    wordCount,
    sentenceCount,
    paragraphCount,
    keyPointCount: keyPoints.length,
    suggestedNodes,
    estimatedReadTime,
    topics
  };
}

// ============================================
// Neural Node Generation
// ============================================

/**
 * Generate neural nodes from content and key points
 */
function generateNeuralNodes(
  content: string,
  keyPoints: string[],
  analysis: ContentAnalysis,
  duration: LearningDuration
): NeuralNode[] {
  const nodes: NeuralNode[] = [];
  const nodesPerDay = Math.ceil(analysis.suggestedNodes / duration);
  
  // Split key points into groups for each node
  const keyPointGroups = [];
  for (let i = 0; i < keyPoints.length; i += nodesPerDay) {
    keyPointGroups.push(keyPoints.slice(i, i + nodesPerDay));
  }
  
  // Generate nodes from content sections
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  const paragraphGroups = [];
  for (let i = 0; i < paragraphs.length; i += Math.ceil(paragraphs.length / analysis.suggestedNodes)) {
    paragraphGroups.push(paragraphs.slice(i, i + Math.ceil(paragraphs.length / analysis.suggestedNodes)));
  }
  
  // Create nodes
  for (let i = 0; i < Math.min(analysis.suggestedNodes, keyPoints.length); i++) {
    const difficulty = analysis.complexity > 70 ? 'advanced' :
                       analysis.complexity > 40 ? 'intermediate' : 'beginner';
    
    const nodeKeyPoints = keyPointGroups[Math.floor(i / nodesPerDay)] || [];
    const nodeContent = paragraphGroups[i]?.join('\n\n') || keyPoints[i] || '';
    
    // Estimate time based on content length
    const estimatedMinutes = Math.max(
      5,
      Math.min(30, Math.ceil(nodeContent.split(/\s+/).length / 150))
    );
    
    nodes.push({
      id: `node-${i + 1}`,
      title: generateNodeTitle(i + 1, nodeKeyPoints[0] || ''),
      description: nodeKeyPoints.slice(0, 2).join('. '),
      content: nodeContent,
      keyPoints: nodeKeyPoints.slice(0, 3),
      estimatedMinutes,
      difficulty,
      prerequisites: i > 0 ? [`node-${i}`] : [],
      resources: [],
      status: 'pending'
    });
  }
  
  return nodes;
}

/**
 * Generate a descriptive title for a neural node
 */
function generateNodeTitle(nodeIndex: number, keyPoint: string): string {
  const titleTemplates = [
    `Neural Node ${nodeIndex}: Foundation`,
    `Node Sync ${nodeIndex}: Core Concepts`,
    `Semantic Index ${nodeIndex}: Key Insights`,
    `Neural Node ${nodeIndex}: Deep Dive`,
    `Node ${nodeIndex}: Knowledge Integration`
  ];
  
  if (keyPoint.length > 0) {
    // Use first few words of key point as part of title
    const shortKey = keyPoint.split(' ').slice(0, 4).join(' ');
    return `Node ${nodeIndex}: ${shortKey}${keyPoint.length > 30 ? '...' : ''}`;
  }
  
  return titleTemplates[nodeIndex % titleTemplates.length];
}

// ============================================
// Learning Path Generation
// ============================================

/**
 * Generate a complete learning path
 */
export function generateLearningPath(
  title: string,
  content: string,
  keyPoints: string[],
  duration: LearningDuration
): LearningPath {
  const analysis = analyzeContent(content, keyPoints);
  const nodes = generateNeuralNodes(content, keyPoints, analysis, duration);
  
  // Distribute nodes across days
  const days: LearningDay[] = [];
  const nodesPerDay = Math.ceil(nodes.length / duration);
  
  for (let dayNum = 1; dayNum <= duration; dayNum++) {
    const startNode = (dayNum - 1) * nodesPerDay;
    const endNode = Math.min(startNode + nodesPerDay, nodes.length);
    const dayNodes = nodes.slice(startNode, endNode);
    
    const totalMinutes = dayNodes.reduce((sum, node) => sum + node.estimatedMinutes, 0);
    
    // Generate daily objectives
    const objectives = dayNodes.map(node => node.title);
    
    days.push({
      day: dayNum,
      date: getDateForDay(dayNum),
      nodes: dayNodes,
      totalMinutes,
      objectives,
      status: dayNum === 1 ? 'available' : 'locked'
    });
  }
  
  const totalMinutes = days.reduce((sum, day) => sum + day.totalMinutes, 0);
  
  return {
    id: `path-${Date.now()}`,
    title,
    description: `A ${duration}-day learning path covering ${analysis.keyPointCount} key concepts`,
    duration,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0,
    contentDensity: analysis.complexity,
    estimatedTotalMinutes: totalMinutes
  };
}

/**
 * Get date for a specific day in the learning path
 */
function getDateForDay(dayNum: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayNum - 1);
  return date.toISOString().split('T')[0];
}

// ============================================
// Learning Path Management
// ============================================

/**
 * Mark a node as completed and unlock next nodes
 */
export function completeNode(
  path: LearningPath,
  nodeId: string
): LearningPath {
  const updatedPath = { ...path };
  let nodeCompleted = false;
  
  // Find and complete the node
  for (const day of updatedPath.days) {
    for (const node of day.nodes) {
      if (node.id === nodeId) {
        node.status = 'completed';
        node.completedAt = new Date().toISOString();
        nodeCompleted = true;
        break;
      }
    }
  }
  
  if (!nodeCompleted) return path;
  
  // Unlock next nodes
  const currentDayIndex = updatedPath.days.findIndex(day =>
    day.nodes.some(node => node.id === nodeId)
  );
  
  // Unlock next day if current day is complete
  if (currentDayIndex >= 0) {
    const currentDay = updatedPath.days[currentDayIndex];
    const allCompleted = currentDay.nodes.every(node => node.status === 'completed');
    
    if (allCompleted && currentDayIndex + 1 < updatedPath.days.length) {
      updatedPath.days[currentDayIndex + 1].status = 'available';
    }
  }
  
  // Calculate progress
  const totalNodes = updatedPath.days.reduce((sum, day) => sum + day.nodes.length, 0);
  const completedNodes = updatedPath.days.reduce(
    (sum, day) => sum + day.nodes.filter(n => n.status === 'completed').length,
    0
  );
  
  updatedPath.progress = Math.round((completedNodes / totalNodes) * 100);
  updatedPath.updatedAt = new Date().toISOString();
  
  return updatedPath;
}

/**
 * Get next available node in the learning path
 */
export function getNextNode(path: LearningPath): NeuralNode | null {
  for (const day of path.days) {
    if (day.status === 'available') {
      for (const node of day.nodes) {
        if (node.status === 'pending') {
          return node;
        }
      }
    }
  }
  return null;
}

/**
 * Calculate estimated completion date
 */
export function getEstimatedCompletion(path: LearningPath): string {
  const remainingDays = path.days.filter(d => d.status !== 'completed').length;
  const date = new Date();
  date.setDate(date.getDate() + remainingDays);
  return date.toISOString().split('T')[0];
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const labels = {
    beginner: '🟢 Beginner Friendly',
    intermediate: '🟡 Intermediate',
    advanced: '🔴 Advanced'
  };
  return labels[difficulty];
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get progress status message
 */
export function getProgressMessage(path: LearningPath): string {
  if (path.progress === 0) {
    return "Ready to start your learning journey!";
  }
  if (path.progress < 50) {
    return "You're making great progress!";
  }
  if (path.progress < 100) {
    return "Almost there! Keep going!";
  }
  return "Congratulations! You've completed the learning path!";
}

export default {
  analyzeContent,
  generateLearningPath,
  completeNode,
  getNextNode,
  getEstimatedCompletion,
  getDifficultyLabel,
  formatDuration,
  getProgressMessage
};

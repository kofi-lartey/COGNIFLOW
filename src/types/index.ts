// User types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  organization?: string;
  website?: string;
  // Onboarding status
  onboardingCompleted: boolean;
  onboardingStep: number;
  workspaceName?: string;
  workspaceId?: string;
  // Subscription status
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'none';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// File types
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  userId: string;
  createdAt: string;
}

// Document types
export interface Document {
  id: string;
  userId: string;
  fileId: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'text';
  status: 'processing' | 'completed' | 'failed';
  content?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

// Learning materials types
export interface Quiz {
  id: string;
  documentId: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface StudyGuide {
  id: string;
  documentId: string;
  title: string;
  sections: StudySection[];
  createdAt: string;
}

export interface StudySection {
  id: string;
  title: string;
  content: string;
  keyPoints?: string[];
}

export interface Summary {
  id: string;
  documentId: string;
  content: string;
  keyPoints: string[];
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Processing types
export interface ProcessingJob {
  id: string;
  documentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    summary?: Summary;
    quiz?: Quiz;
    studyGuide?: StudyGuide;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Neural Processing types
export type NeuralStatus = 'IDLE' | 'FETCHING' | 'VECTORIZING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';

export interface NeuralFileItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'video' | 'audio' | 'text';
  status: NeuralStatus;
  progress: number;
  message: string;
  uploadedAt: string;
  processingTime?: number;
  result?: {
    summary: string;
    keyPoints: string[];
    persona: 'kid' | 'teen' | 'expert';
    processingTime: number;
    mode: 'local' | 'whisper';
  };
  learningPath?: {
    id: string;
    title: string;
    duration: 3 | 7;
    progress: number;
    days: Array<{
      day: number;
      status: 'locked' | 'available' | 'completed';
    }>;
  };
  error?: string;
}
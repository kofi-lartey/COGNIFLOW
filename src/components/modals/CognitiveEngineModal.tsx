'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  DraftingCompass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  FileText,
  Table,
  Image,
  Music,
  Video,
  FileQuestion,
  Zap,
  Clock,
  TrendingUp,
  Shield,
  Settings,
  ChevronDown,
  Info,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

/* ================= TYPES ================= */

export type ProcessingState = 'idle' | 'processing' | 'success' | 'error';
export type ProcessingStage = 
  | 'initializing'
  | 'extracting'
  | 'vectorizing'
  | 'analyzing'
  | 'generating'
  | 'finalizing'
  | 'complete'
  | 'failed';

export type ProcessingOption = 'quiz' | 'study-scheme' | 'vivid-lesson';

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  url: string;
  publicId?: string;
  resourceType?: string;
  pageCount?: number;
  duration?: number;
  dimensions?: { width: number; height: number };
}

export interface ProcessingProgress {
  stage: ProcessingStage;
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
  tokensProcessed?: number;
  totalTokens?: number;
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: string;
  recoverable: boolean;
  suggestedAction?: string;
}

export interface ProcessingResult {
  option: ProcessingOption;
  outputId: string;
  outputUrl?: string;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    confidence: number;
  };
}

interface CognitiveEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileMetadata | null;
  onProcessingSelect: (option: ProcessingOption) => void;
  processingState?: ProcessingState;
  processingProgress?: ProcessingProgress;
  processingError?: ProcessingError | null;
  processingResult?: ProcessingResult | null;
  onRetry?: () => void;
  onContactSupport?: () => void;
  onReturnToDashboard?: () => void;
  onViewOutput?: (result: ProcessingResult) => void;
  onAdvancedSettings?: () => void;
  className?: string;
}

/* ================= CONSTANTS ================= */

const PROCESSING_STAGES: Record<ProcessingStage, { label: string; icon: React.ReactNode; description: string }> = {
  initializing: {
    label: 'Initializing Engine',
    icon: <Zap className="w-5 h-5" />,
    description: 'Preparing cognitive processing pipeline',
  },
  extracting: {
    label: 'Extracting Content',
    icon: <FileText className="w-5 h-5" />,
    description: 'Parsing and structuring document data',
  },
  vectorizing: {
    label: 'Vectorizing Knowledge',
    icon: <BrainCircuit className="w-5 h-5" />,
    description: 'Converting content to semantic embeddings',
  },
  analyzing: {
    label: 'Analyzing Patterns',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Identifying key concepts and relationships',
  },
  generating: {
    label: 'Generating Output',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Creating your personalized learning material',
  },
  finalizing: {
    label: 'Finalizing',
    icon: <Shield className="w-5 h-5" />,
    description: 'Quality checking and optimizing output',
  },
  complete: {
    label: 'Complete',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Processing finished successfully',
  },
  failed: {
    label: 'Failed',
    icon: <AlertCircle className="w-5 h-5" />,
    description: 'An error occurred during processing',
  },
};

const FILE_TYPE_COMPATIBILITY: Record<string, string[]> = {
  document: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'],
  spreadsheet: ['xlsx', 'csv', 'xls', 'ods'],
  image: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
};

const OPTION_CONFIG: Record<ProcessingOption, {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
  metricValue: number;
  estimatedTime: string;
  features: string[];
}> = {
  quiz: {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'Generate Quiz',
    description: 'Auto-extracted knowledge validation markers with adaptive difficulty',
    metric: 'PRECISION',
    metricValue: 70,
    estimatedTime: '~30s',
    features: ['Multiple choice', 'True/False', 'Fill-in-blank', 'Adaptive scoring'],
  },
  'study-scheme': {
    icon: <DraftingCompass className="w-6 h-6" />,
    title: 'Draft Study Scheme',
    description: 'Strategic roadmap for long-term retention with spaced repetition',
    metric: 'DEPTH',
    metricValue: 55,
    estimatedTime: '~45s',
    features: ['Concept mapping', 'Spaced repetition', 'Progress tracking', 'Milestone goals'],
  },
  'vivid-lesson': {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Vivid Lesson',
    description: 'Interactive narrative with immersive context and visual aids',
    metric: 'CLARITY',
    metricValue: 80,
    estimatedTime: '~60s',
    features: ['Story-driven', 'Visual examples', 'Interactive elements', 'Audio narration'],
  },
};

/* ================= MAIN COMPONENT ================= */

export default function CognitiveEngineModal({
  isOpen,
  onClose,
  file,
  onProcessingSelect,
  processingState = 'idle',
  processingProgress,
  processingError = null,
  processingResult = null,
  onRetry,
  onContactSupport,
  onReturnToDashboard,
  onViewOutput,
  onAdvancedSettings,
  className = '',
}: CognitiveEngineModalProps) {
  const [selectedOption, setSelectedOption] = useState<ProcessingOption | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousStateRef = useRef<ProcessingState>('idle');

  // Track state transitions for animations
  useEffect(() => {
    if (processingState !== previousStateRef.current) {
      previousStateRef.current = processingState;
    }
  }, [processingState]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && processingState === 'idle') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, processingState]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || !file) return null;

  const fileCategory = getFileCategory(file.type);
  const availableOptions = getAvailableOptions(fileCategory);

  const handleOptionClick = useCallback((option: ProcessingOption) => {
    setSelectedOption(option);
    onProcessingSelect(option);
  }, [onProcessingSelect]);

  const handleRetry = useCallback(() => {
    setSelectedOption(null);
    onRetry?.();
  }, [onRetry]);

  // Render based on processing state
  const renderContent = () => {
    switch (processingState) {
      case 'processing':
        return (
          <ProcessingView
            progress={processingProgress}
            selectedOption={selectedOption}
            fileName={file.name}
          />
        );
      case 'success':
        return (
          <SuccessView
            result={processingResult}
            selectedOption={selectedOption}
            onViewOutput={onViewOutput}
            onReturnToDashboard={onReturnToDashboard}
            onProcessAnother={() => {
              setSelectedOption(null);
              onClose();
            }}
          />
        );
      case 'error':
        return (
          <ErrorView
            error={processingError}
            selectedOption={selectedOption}
            fileName={file.name}
            onRetry={handleRetry}
            onContactSupport={onContactSupport}
            onReturnToDashboard={onReturnToDashboard}
          />
        );
      default:
        return (
          <SelectionView
            file={file}
            fileCategory={fileCategory}
            availableOptions={availableOptions}
            selectedOption={selectedOption}
            onOptionSelect={handleOptionClick}
            onClose={onClose}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails(!showDetails)}
            onAdvancedSettings={onAdvancedSettings}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          w-full max-w-[720px] max-h-[90vh] overflow-y-auto
          rounded-2xl border border-cyan-400/20
          bg-gradient-to-b from-[#0B1220] to-[#070d1f]
          shadow-[0_0_80px_rgba(34,211,238,0.08)]
          animate-in fade-in zoom-in-95 duration-200
          ${className}
        `}
      >
        {renderContent()}
      </div>
    </div>
  );
}

/* ================= SELECTION VIEW ================= */

interface SelectionViewProps {
  file: FileMetadata;
  fileCategory: string;
  availableOptions: ProcessingOption[];
  selectedOption: ProcessingOption | null;
  onOptionSelect: (option: ProcessingOption) => void;
  onClose: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  onAdvancedSettings?: () => void;
}

function SelectionView({
  file,
  fileCategory,
  availableOptions,
  selectedOption,
  onOptionSelect,
  onClose,
  showDetails,
  onToggleDetails,
  onAdvancedSettings,
}: SelectionViewProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 id="modal-title" className="text-xl font-semibold text-white mb-2">
            Initialize Cognitive Engine
          </h2>
          <p className="text-sm text-[#6B7280] max-w-md">
            Select an operation to refine your current knowledge vector.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#6B7280] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* File Info Card */}
      <div className="mb-6 p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
            <FileCategoryIcon category={fileCategory} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{file.name}</p>
            <p className="text-xs text-[#6B7280]">
              {getFileTypeLabel(file.type)} • {formatFileSize(file.size)}
              {file.pageCount && ` • ${file.pageCount} pages`}
              {file.duration && ` • ${formatDuration(file.duration)}`}
            </p>
          </div>
          <div className="px-2 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded font-medium">
            {fileCategory.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {(['quiz', 'study-scheme', 'vivid-lesson'] as ProcessingOption[]).map((option) => (
          <OptionCard
            key={option}
            option={option}
            config={OPTION_CONFIG[option]}
            isAvailable={availableOptions.includes(option)}
            isSelected={selectedOption === option}
            showDetails={showDetails}
            onClick={() => onOptionSelect(option)}
          />
        ))}
      </div>

      {/* Details Toggle */}
      <button
        onClick={onToggleDetails}
        className="w-full flex items-center justify-center gap-2 text-xs text-[#6B7280] hover:text-cyan-400 transition-colors mb-4"
      >
        <Info className="w-3 h-3" />
        {showDetails ? 'Hide' : 'Show'} feature details
        <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#6B7280] uppercase">
          <Zap className="w-3 h-3 text-cyan-400" />
          Engine Status: Optimized
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-sm text-[#9CA3AF] hover:text-white transition-colors px-3 py-1.5"
          >
            Cancel
          </button>
          {onAdvancedSettings && (
            <button
              onClick={onAdvancedSettings}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#111827] border border-[#1F2937] hover:bg-white/5 text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Advanced Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= OPTION CARD ================= */

interface OptionCardProps {
  option: ProcessingOption;
  config: typeof OPTION_CONFIG[ProcessingOption];
  isAvailable: boolean;
  isSelected: boolean;
  showDetails: boolean;
  onClick: () => void;
}

function OptionCard({
  option,
  config,
  isAvailable,
  isSelected,
  showDetails,
  onClick,
}: OptionCardProps) {
  if (!isAvailable) {
    return (
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 opacity-50 cursor-not-allowed">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-[#1E293B] rounded-lg flex items-center justify-center text-[#4B5563]">
            {config.icon}
          </div>
          <div className="flex-1">
            <p className="text-[#6B7280] font-medium">{config.title}</p>
            <p className="text-xs text-[#4B5563]">{config.description}</p>
          </div>
          <div className="text-xs text-[#4B5563] bg-[#1E293B] px-2 py-1 rounded">
            Unavailable
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      className={`
        group rounded-xl border cursor-pointer transition-all duration-200
        ${isSelected
          ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
          : 'border-[#1E293B] hover:border-cyan-400/40 hover:bg-cyan-400/[0.02]'
        }
      `}
    >
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center transition-colors
              ${isSelected ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400/15'}
            `}>
              {config.icon}
            </div>
            <div>
              <p className="text-white font-medium">{config.title}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-cyan-400 font-medium tracking-wide">{config.metric}</p>
              <div className="w-24 h-[3px] bg-[#020617] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full transition-all duration-500"
                  style={{ width: `${config.metricValue}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{config.estimatedTime}</span>
            </div>
            <ChevronRight className={`w-5 h-5 transition-colors ${isSelected ? 'text-cyan-400' : 'text-[#6B7280] group-hover:text-cyan-400/60'}`} />
          </div>
        </div>

        {/* Expandable Features */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {config.features.map((feature, index) => (
                <span
                  key={index}
                  className="text-[10px] px-2 py-1 rounded-full bg-cyan-400/10 text-cyan-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= PROCESSING VIEW ================= */

interface ProcessingViewProps {
  progress?: ProcessingProgress;
  selectedOption: ProcessingOption | null;
  fileName: string;
}

function ProcessingView({ progress, selectedOption, fileName }: ProcessingViewProps) {
  const currentStage = progress?.stage || 'initializing';
  const percentage = progress?.percentage || 0;
  const stageInfo = PROCESSING_STAGES[currentStage];
  const optionConfig = selectedOption ? OPTION_CONFIG[selectedOption] : null;

  // Calculate which stages are complete
  const stageOrder: ProcessingStage[] = ['initializing', 'extracting', 'vectorizing', 'analyzing', 'generating', 'finalizing'];
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-400/10 text-cyan-400 mb-4">
          {optionConfig?.icon || <BrainCircuit className="w-8 h-8" />}
        </div>
        <h2 className="text-xl font-semibold text-white mb-1">
          {optionConfig?.title || 'Processing'}
        </h2>
        <p className="text-sm text-[#6B7280] truncate max-w-xs mx-auto">
          {fileName}
        </p>
      </div>

      {/* Main Progress Circle */}
      <div className="relative w-40 h-40 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="72"
            stroke="#1E293B"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="72"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 72}`}
            strokeDashoffset={`${2 * Math.PI * 72 * (1 - percentage / 100)}`}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
          <span className="text-xs text-[#6B7280] mt-1">Complete</span>
        </div>
      </div>

      {/* Current Stage */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 animate-pulse">
            {stageInfo.icon}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{stageInfo.label}</p>
            <p className="text-xs text-[#6B7280]">
              {progress?.message || stageInfo.description}
            </p>
          </div>
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="flex items-center justify-between mb-6 px-2">
        {stageOrder.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
              ${index < currentStageIndex
                ? 'bg-cyan-400 text-[#0B1220]'
                : index === currentStageIndex
                  ? 'bg-cyan-400/20 text-cyan-400 ring-2 ring-cyan-400/50'
                  : 'bg-[#1E293B] text-[#4B5563]'
              }
            `}>
              {index < currentStageIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < stageOrder.length - 1 && (
              <div className={`
                flex-1 h-[2px] mx-1
                ${index < currentStageIndex ? 'bg-cyan-400' : 'bg-[#1E293B]'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Tokens</p>
          <p className="text-sm font-medium text-white mt-1">
            {progress?.tokensProcessed?.toLocaleString() || '0'}
            {progress?.totalTokens && (
              <span className="text-[#6B7280]">/{progress.totalTokens.toLocaleString()}</span>
            )}
          </p>
        </div>
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">ETA</p>
          <p className="text-sm font-medium text-white mt-1">
            {progress?.estimatedTimeRemaining
              ? formatTime(progress.estimatedTimeRemaining)
              : '--:--'
            }
          </p>
        </div>
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Stage</p>
          <p className="text-sm font-medium text-white mt-1">
            {currentStageIndex + 1}/{stageOrder.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= SUCCESS VIEW ================= */

interface SuccessViewProps {
  result: ProcessingResult | null;
  selectedOption: ProcessingOption | null;
  onViewOutput?: (result: ProcessingResult) => void;
  onReturnToDashboard?: () => void;
  onProcessAnother: () => void;
}

function SuccessView({
  result,
  selectedOption,
  onViewOutput,
  onReturnToDashboard,
  onProcessAnother,
}: SuccessViewProps) {
  const optionConfig = selectedOption ? OPTION_CONFIG[selectedOption] : null;

  return (
    <div className="p-8">
      {/* Success Animation */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Processing Complete!
        </h2>
        <p className="text-sm text-[#6B7280]">
          Your {optionConfig?.title.toLowerCase() || 'content'} has been generated successfully.
        </p>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#0F172A] border border-emerald-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              {optionConfig?.icon || <Sparkles className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{optionConfig?.title}</p>
              <p className="text-xs text-[#6B7280]">ID: {result.outputId}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#070d1f] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#6B7280] uppercase">Time</p>
              <p className="text-sm font-medium text-white mt-1">
                {(result.metadata.processingTime / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="bg-[#070d1f] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#6B7280] uppercase">Tokens</p>
              <p className="text-sm font-medium text-white mt-1">
                {result.metadata.tokensUsed.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#070d1f] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#6B7280] uppercase">Confidence</p>
              <p className="text-sm font-medium text-emerald-400 mt-1">
                {Math.round(result.metadata.confidence * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {result && onViewOutput && (
          <button
            onClick={() => onViewOutput(result)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-400 hover:bg-cyan-300 text-[#0B1220] font-medium rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Output
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onProcessAnother}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] border border-[#1F2937] hover:bg-white/5 text-white rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Process Another
          </button>
          {onReturnToDashboard && (
            <button
              onClick={onReturnToDashboard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] border border-[#1F2937] hover:bg-white/5 text-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= ERROR VIEW ================= */

interface ErrorViewProps {
  error: ProcessingError | null;
  selectedOption: ProcessingOption | null;
  fileName: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  onReturnToDashboard?: () => void;
}

function ErrorView({
  error,
  selectedOption,
  fileName,
  onRetry,
  onContactSupport,
  onReturnToDashboard,
}: ErrorViewProps) {
  const optionConfig = selectedOption ? OPTION_CONFIG[selectedOption] : null;

  return (
    <div className="p-8">
      {/* Error Animation */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-400 mb-4 animate-in zoom-in duration-300">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Processing Failed
        </h2>
        <p className="text-sm text-[#6B7280]">
          We encountered an issue while processing your {optionConfig?.title.toLowerCase() || 'request'}.
        </p>
      </div>

      {/* Error Details */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium mb-1">
              {error?.message || 'An unexpected error occurred'}
            </p>
            {error?.details && (
              <p className="text-xs text-[#6B7280] mb-2">{error.details}</p>
            )}
            {error?.code && (
              <p className="text-[10px] text-red-400/60 font-mono">
                Error Code: {error.code}
              </p>
            )}
          </div>
        </div>

        {error?.suggestedAction && (
          <div className="mt-4 pt-4 border-t border-red-500/10">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#9CA3AF]">
                <span className="text-cyan-400 font-medium">Suggestion:</span> {error.suggestedAction}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Reference */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 mb-6 flex items-center gap-3">
        <FileText className="w-4 h-4 text-[#6B7280]" />
        <p className="text-sm text-[#9CA3AF] truncate flex-1">{fileName}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {error?.recoverable !== false && onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-400 hover:bg-cyan-300 text-[#0B1220] font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          {onContactSupport && (
            <button
              onClick={onContactSupport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] border border-[#1F2937] hover:bg-white/5 text-white rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </button>
          )}
          {onReturnToDashboard && (
            <button
              onClick={onReturnToDashboard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] border border-[#1F2937] hover:bg-white/5 text-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function FileCategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    document: <FileText className="w-5 h-5" />,
    spreadsheet: <Table className="w-5 h-5" />,
    image: <Image className="w-5 h-5" />,
    audio: <Music className="w-5 h-5" />,
    video: <Video className="w-5 h-5" />,
  };
  return <>{icons[category] || <FileQuestion className="w-5 h-5" />}</>;
}

/* ================= UTILITY FUNCTIONS ================= */

function getFileCategory(fileType: string): string {
  const ext = fileType.split('.').pop()?.toLowerCase() || '';
  for (const [category, extensions] of Object.entries(FILE_TYPE_COMPATIBILITY)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return 'unknown';
}

function getAvailableOptions(category: string): ProcessingOption[] {
  const optionMap: Record<string, ProcessingOption[]> = {
    document: ['quiz', 'study-scheme', 'vivid-lesson'],
    spreadsheet: ['quiz', 'study-scheme', 'vivid-lesson'],
    image: ['quiz', 'vivid-lesson'],
    audio: ['vivid-lesson'],
    video: ['vivid-lesson'],
  };
  return optionMap[category] || ['quiz', 'study-scheme', 'vivid-lesson'];
}

function getFileTypeLabel(type: string): string {
  const ext = type.split('.').pop()?.toUpperCase() || 'FILE';
  const labels: Record<string, string> = {
    PDF: 'PDF Document',
    DOC: 'Word Document',
    DOCX: 'Word Document',
    TXT: 'Text File',
    MD: 'Markdown',
    XLSX: 'Excel Spreadsheet',
    CSV: 'CSV File',
    XLS: 'Excel Spreadsheet',
    JPEG: 'JPEG Image',
    JPG: 'JPG Image',
    PNG: 'PNG Image',
    MP3: 'MP3 Audio',
    WAV: 'WAV Audio',
    MP4: 'MP4 Video',
    MOV: 'MOV Video',
  };
  return labels[ext] || ext;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

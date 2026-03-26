/**
 * CogniFlow Neural Activity Table Component
 * 
 * Integrates with the Command Center dashboard to display real-time
 * neural processing status with smooth status transitions:
 * FETCHING -> VECTORIZING -> ANALYZING -> COMPLETE
 * 
 * Uses the Obsidian/CogniFlow aesthetic: Deep navy #070d1f, Cyan #22d3ee
 */

'use client';

import React from 'react';
import { FileText, MoreHorizontal, Activity, Brain, Zap, Layers } from 'lucide-react';
import { useNeuralProcessor, type NeuralFileItem, type NeuralStatus } from '@/hooks/useNeuralProcessor';

// ============================================
// Type Definitions
// ============================================

interface NeuralActivityTableProps {
  files?: NeuralFileItem[];
  onFileClick?: (file: NeuralFileItem) => void;
  maxDisplay?: number;
  showFilters?: boolean;
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: NeuralStatus }) {
  const config: Record<NeuralStatus, { label: string; bgClass: string; icon: string }> = {
    IDLE: { label: 'Ready', bgClass: 'bg-gray-500/10 text-gray-400', icon: '○' },
    FETCHING: { label: 'Fetching', bgClass: 'bg-blue-500/10 text-blue-400', icon: '↓' },
    VECTORIZING: { label: 'Vectorizing', bgClass: 'bg-cyan-500/10 text-cyan-400', icon: '◈' },
    ANALYZING: { label: 'Analyzing', bgClass: 'bg-purple-500/10 text-purple-400', icon: '⚡' },
    COMPLETE: { label: 'Complete', bgClass: 'bg-emerald-500/10 text-emerald-400', icon: '✓' },
    ERROR: { label: 'Error', bgClass: 'bg-red-500/10 text-red-400', icon: '✕' }
  };

  const { label, bgClass, icon } = config[status] || config.IDLE;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgClass} inline-flex items-center gap-1`}>
      <span className="text-xs">{icon}</span>
      {label}
    </span>
  );
}

// ============================================
// Progress Bar Component
// ============================================

function ProgressBar({ progress, status }: { progress: number; status: NeuralStatus }) {
  const getColor = (): string => {
    switch (status) {
      case 'FETCHING': return 'bg-blue-500';
      case 'VECTORIZING': return 'bg-cyan-500';
      case 'ANALYZING': return 'bg-purple-500';
      case 'COMPLETE': return 'bg-emerald-500';
      case 'ERROR': return 'bg-red-500';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="w-24 h-1.5 bg-[#020617] rounded-full overflow-hidden">
      <div 
        className={`h-full ${getColor()} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// ============================================
// Table Row Component
// ============================================

function NeuralRow({ 
  file, 
  onClick 
}: { 
  file: NeuralFileItem; 
  onClick?: () => void;
}) {
  const formatTime = (ms?: number): string => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getFileIcon = () => {
    switch (file.type) {
      case 'pdf': return <FileText size={16} className="text-red-400" />;
      case 'docx': return <FileText size={16} className="text-blue-400" />;
      case 'video': return <Activity size={16} className="text-purple-400" />;
      case 'audio': return <Zap size={16} className="text-yellow-400" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  return (
    <tr 
      className="border-b border-[#1E293B] hover:bg-white/5 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {getFileIcon()}
          <div className="flex flex-col">
            <span className="text-white font-medium">{file.name}</span>
            <span className="text-xs text-[#6B7280]">
              {file.type.toUpperCase()} • {file.message}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <StatusBadge status={file.status} />
          {file.status !== 'IDLE' && file.status !== 'COMPLETE' && file.status !== 'ERROR' && (
            <ProgressBar progress={file.progress} status={file.status} />
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[#6B7280]">
            {formatTime(file.processingTime)}
          </span>
          {file.result && (
            <span className="text-xs text-cyan-400">
              {file.result.mode === 'local' ? 'Local' : 'Whisper'}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {file.learningPath && (
            <span className="text-xs text-cyan-400 flex items-center gap-1">
              <Layers size={12} />
              {file.learningPath.duration}d
            </span>
          )}
          <MoreHorizontal className="text-[#6B7280] cursor-pointer hover:text-white" />
        </div>
      </td>
    </tr>
  );
}

// ============================================
// Main Component
// ============================================

export default function NeuralActivityTable({
  files: externalFiles,
  onFileClick,
  maxDisplay = 10,
  showFilters = true
}: NeuralActivityTableProps) {
  // Use the neural processor hook
  const { files: hookFiles, status, progress, message } = useNeuralProcessor();
  
  // Use external files if provided, otherwise use hook files
  const files = externalFiles || hookFiles;
  const displayFiles = files.slice(0, maxDisplay);

  const [filter, setFilter] = React.useState<string>('ALL');

  const filteredFiles = React.useMemo(() => {
    if (filter === 'ALL') return displayFiles;
    if (filter === 'PROCESSING') {
      return displayFiles.filter(f => 
        ['FETCHING', 'VECTORIZING', 'ANALYZING'].includes(f.status)
      );
    }
    if (filter === 'COMPLETE') {
      return displayFiles.filter(f => f.status === 'COMPLETE');
    }
    return displayFiles;
  }, [displayFiles, filter]);

  return (
    <div className="bg-[#0D1628] border border-[#1E293B] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 flex justify-between border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Brain className="text-cyan-400 w-4" />
          <span className="font-semibold">Neural Node Sync</span>
          {status !== 'IDLE' && (
            <span className="ml-2 text-xs text-cyan-400 animate-pulse">
              {progress > 0 && `${Math.round(progress)}%`}
            </span>
          )}
        </div>

        {showFilters && (
          <div className="flex gap-2 text-xs">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded ${filter === 'ALL' ? 'bg-white/10 text-white' : 'text-[#6B7280] hover:text-white'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilter('PROCESSING')}
              className={`px-3 py-1 rounded ${filter === 'PROCESSING' ? 'bg-cyan-500/20 text-cyan-400' : 'text-[#6B7280] hover:text-white'}`}
            >
              PROCESSING
            </button>
            <button 
              onClick={() => setFilter('COMPLETE')}
              className={`px-3 py-1 rounded ${filter === 'COMPLETE' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#6B7280] hover:text-white'}`}
            >
              COMPLETE
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="text-xs text-[#6B7280] border-b border-[#1E293B]">
          <tr>
            <th className="px-6 py-4 text-left">DOCUMENT NAME</th>
            <th className="px-6 py-4 text-left">NEURAL STATUS</th>
            <th className="px-6 py-4 text-left">PROCESSING TIME</th>
            <th className="px-6 py-4 text-right">ACTION</th>
          </tr>
        </thead>

        <tbody>
          {filteredFiles.length > 0 ? (
            filteredFiles.map(file => (
              <NeuralRow 
                key={file.id} 
                file={file}
                onClick={() => onFileClick?.(file)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-[#6B7280]">
                <div className="flex flex-col items-center gap-2">
                  <Brain size={32} className="opacity-50" />
                  <p>No neural activity yet</p>
                  <p className="text-xs">Upload a document to start semantic indexing</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer */}
      {files.length > maxDisplay && (
        <div className="text-center py-4 text-xs text-[#6B7280] border-t border-[#1E293B]">
          VIEW ALL ACTIVITY ({files.length} total)
        </div>
      )}
    </div>
  );
}

// Export types for external use
export type { NeuralFileItem, NeuralStatus };

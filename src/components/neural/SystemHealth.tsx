/**
 * CogniFlow System Health Component
 * 
 * Displays real-time "System Health" bars that show neural engine load,
 * API latency, and processing progress with smooth animations.
 * 
 * Uses the Obsidian/CogniFlow aesthetic:
 * - Deep navy: #070d1f / #0B1221
 * - Cyan: #22d3ee / #06b6d4
 * - High-contrast typography
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Brain, Zap, Cpu, Gauge } from 'lucide-react';

interface SystemHealthProps {
  neuralLoad?: number;
  apiLatency?: number;
  processingProgress?: number;
  showDetails?: boolean;
}

// Individual stat bar component
function StatBar({ 
  label, 
  value, 
  maxValue, 
  icon: Icon, 
  color = 'cyan',
  unit = '%'
}: { 
  label: string; 
  value: number; 
  maxValue?: number; 
  icon: React.ElementType;
  color?: 'cyan' | 'blue' | 'purple' | 'emerald' | 'red';
  unit?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    // Animate value changes
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = maxValue ? (value / maxValue) * 100 : value;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const colorClasses = {
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    emerald: 'bg-emerald-400',
    red: 'bg-red-400'
  };

  const iconColorClasses = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400'
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#6B7280] flex items-center gap-1">
          <Icon size={12} className={iconColorClasses[color]} />
          {label}
        </span>
        <span className={iconColorClasses[color]}>
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-[#020617] rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}

// Processing status component
function ProcessingStatus({ 
  progress, 
  status, 
  message 
}: { 
  progress: number; 
  status: string; 
  message: string;
}) {
  const getStatusColor = (): 'cyan' | 'blue' | 'purple' | 'emerald' | 'red' => {
    switch (status) {
      case 'FETCHING': return 'blue';
      case 'VECTORIZING': return 'cyan';
      case 'ANALYZING': return 'purple';
      case 'COMPLETE': return 'emerald';
      case 'ERROR': return 'red';
      default: return 'cyan';
    }
  };

  return (
    <div className="mt-4 p-3 bg-[#0B1221] rounded-lg border border-[#1E293B]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#6B7280]">Neural Processing</span>
        <span className={`text-xs font-semibold ${
          getStatusColor() === 'cyan' ? 'text-cyan-400' :
          getStatusColor() === 'blue' ? 'text-blue-400' :
          getStatusColor() === 'purple' ? 'text-purple-400' :
          getStatusColor() === 'emerald' ? 'text-emerald-400' :
          'text-red-400'
        }`}>
          {status}
        </span>
      </div>
      <div className="h-2 bg-[#020617] rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full bg-${getStatusColor()}-400 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[#6B7280] truncate">{message}</p>
    </div>
  );
}

// Main System Health component
export default function SystemHealth({
  neuralLoad = 12,
  apiLatency = 24,
  processingProgress = 0,
  showDetails = true
}: SystemHealthProps) {
  const [load, setLoad] = useState(neuralLoad);
  const [latency, setLatency] = useState(apiLatency);
  const [progress, setProgress] = useState(processingProgress);
  const [status, setStatus] = useState('IDLE');
  const [message, setMessage] = useState('Ready for neural processing');

  // Simulate real-time updates (in production, this would come from the worker)
  useEffect(() => {
    const interval = setInterval(() => {
      // Random fluctuations for demo
      setLoad(prev => Math.max(5, Math.min(30, prev + (Math.random() - 0.5) * 5)));
      setLatency(prev => Math.max(10, Math.min(50, prev + (Math.random() - 0.5) * 10)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update progress when it changes
  useEffect(() => {
    setProgress(processingProgress);
    if (processingProgress > 0 && processingProgress < 100) {
      setStatus('PROCESSING');
    } else if (processingProgress >= 100) {
      setStatus('COMPLETE');
    } else {
      setStatus('IDLE');
    }
  }, [processingProgress]);

  return (
    <div className="bg-[#0D1628] border border-[#1E293B] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#6B7280]">System Health</p>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Main Stats */}
      <StatBar 
        label="Neural Engine Load" 
        value={Math.round(load)} 
        icon={Brain}
        color="cyan"
      />
      <StatBar 
        label="API Latency" 
        value={Math.round(latency)} 
        icon={Activity}
        color="blue"
        unit="ms"
      />
      <StatBar 
        label="Memory Usage" 
        value={Math.round(load * 2.5)} 
        icon={Cpu}
        color="purple"
        unit="MB"
      />

      {/* Processing Status */}
      {showDetails && progress > 0 && (
        <ProcessingStatus 
          progress={progress}
          status={status}
          message={message}
        />
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1E293B]">
        <div className="text-center">
          <p className="text-lg font-bold text-cyan-400">{Math.round(load * 3.2)}</p>
          <p className="text-[10px] text-[#6B7280]">Active Nodes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">99.9%</p>
          <p className="text-[10px] text-[#6B7280]">Uptime</p>
        </div>
      </div>
    </div>
  );
}

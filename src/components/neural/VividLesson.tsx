/**
 * CogniFlow Vivid Lesson Component
 * 
 * Displays the generated Vivid Lesson with Age-Adaptive tier toggle.
 * Allows switching between Kid, Teen, and Expert persona views.
 * 
 * Uses the Obsidian/CogniFlow aesthetic with proper styling.
 */

'use client';

import React, { useState } from 'react';
import { Brain, BookOpen, Layers, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

type PersonaType = 'kid' | 'teen' | 'expert';

interface Section {
  title: string;
  content: string;
  keyPoints: string[];
}

interface VividLessonData {
  title: string;
  sections: Section[];
  persona: PersonaType;
}

interface VividLessonProps {
  data: VividLessonData;
  onPersonaChange?: (persona: PersonaType) => void;
  isLoading?: boolean;
}

// Persona configuration
const PERSONA_CONFIG: Record<PersonaType, { 
  label: string; 
  icon: string; 
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  kid: {
    label: 'Kid',
    icon: '🌟',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Simple, fun language with emojis'
  },
  teen: {
    label: 'Teen',
    icon: '🔥',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Relatable, engaging, modern'
  },
  expert: {
    label: 'Expert',
    icon: '📊',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Technical, detailed, professional'
  }
};

// Key Point Component
function KeyPoint({ point, persona }: { point: string; persona: PersonaType }) {
  const config = PERSONA_CONFIG[persona];
  
  const bulletIcon = {
    kid: '⭐',
    teen: '🎯',
    expert: '▸'
  };
  
  return (
    <div className="flex items-start gap-2 py-1">
      <span className={config.color}>{bulletIcon[persona]}</span>
      <span className="text-gray-300 text-sm">{point}</span>
    </div>
  );
}

// Section Component
function LessonSection({ 
  section, 
  persona, 
  index 
}: { 
  section: Section; 
  persona: PersonaType;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  
  return (
    <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#0B1221]/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-sm">{index + 1}</span>
          </div>
          <span className="font-medium text-white">{section.title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="text-gray-400" size={20} />
        ) : (
          <ChevronRight className="text-gray-400" size={20} />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[#1E293B]">
          <div className="pt-4 space-y-4">
            <p className="text-gray-300 leading-relaxed">{section.content}</p>
            
            {section.keyPoints.length > 0 && (
              <div className="bg-[#0D1628] rounded-lg p-4">
                <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                  Key Points
                </h4>
                <div className="space-y-1">
                  {section.keyPoints.map((point, i) => (
                    <KeyPoint key={i} point={point} persona={persona} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Persona Toggle Component
function PersonaToggle({ 
  currentPersona, 
  onChange 
}: { 
  currentPersona: PersonaType;
  onChange: (persona: PersonaType) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-[#0D1628] rounded-lg p-1">
      {(Object.keys(PERSONA_CONFIG) as PersonaType[]).map((persona) => {
        const config = PERSONA_CONFIG[persona];
        const isActive = currentPersona === persona;
        
        return (
          <button
            key={persona}
            onClick={() => onChange(persona)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all
              ${isActive 
                ? `${config.bgColor} ${config.borderColor} border` 
                : 'hover:bg-white/5'
              }
            `}
          >
            <span>{config.icon}</span>
            <span className={`text-sm font-medium ${isActive ? config.color : 'text-gray-400'}`}>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Main Vivid Lesson Component
export default function VividLesson({ 
  data, 
  onPersonaChange,
  isLoading = false 
}: VividLessonProps) {
  const [persona, setPersona] = useState<PersonaType>(data?.persona || 'teen');
  
  const handlePersonaChange = (newPersona: PersonaType) => {
    setPersona(newPersona);
    onPersonaChange?.(newPersona);
  };
  
  const config = PERSONA_CONFIG[persona];
  
  if (isLoading) {
    return (
      <div className="bg-[#0D1628] border border-[#1E293B] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-cyan-400 animate-pulse" />
          <span className="text-lg font-semibold">Generating Vivid Lesson...</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-[#1E293B] rounded animate-pulse" />
          <div className="h-4 bg-[#1E293B] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[#1E293B] rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }
  
  if (!data || !data.sections) {
    return (
      <div className="bg-[#0D1628] border border-[#1E293B] rounded-2xl p-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No lesson data available</p>
        <p className="text-xs text-gray-600 mt-2">Upload a document to generate a vivid lesson</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Brain className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{data.title}</h2>
            <p className="text-xs text-[#6B7280]">
              {config.description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Persona Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280]">Age-Adaptive View:</span>
          <PersonaToggle currentPersona={persona} onChange={handlePersonaChange} />
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}>
          <span>{config.icon}</span>
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label} Mode
          </span>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <Layers size={14} />
        <span>{data.sections.length} Sections</span>
        <span>•</span>
        <span>Persona: {persona}</span>
      </div>
      
      {/* Sections */}
      <div className="space-y-4">
        {data.sections.map((section, index) => (
          <LessonSection 
            key={index}
            section={section}
            persona={persona}
            index={index}
          />
        ))}
      </div>
      
      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span>Total Sections: {data.sections.length}</span>
          <span>•</span>
          <span>Current View: {persona}</span>
        </div>
        
        <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          <Sparkles size={14} />
          Regenerate Lesson
        </button>
      </div>
    </div>
  );
}

// Export types
export type { VividLessonData, PersonaType };
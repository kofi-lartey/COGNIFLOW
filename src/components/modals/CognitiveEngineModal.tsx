'use client';
import React, { useState } from 'react';
import {
    X, ChevronRight, Sparkles, BrainCircuit, DraftingCompass
} from 'lucide-react';
import ProcessingStates from './ProcessingStates';

/* ================= TYPES ================= */

export type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

export interface FileMetadata {
    name: string;
    type: string;
    size: number;
    url: string;
    publicId?: string;
    resourceType?: string;
}

interface CognitiveEngineModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileMetadata | null;
    onProcessingSelect: (option: 'quiz' | 'study-scheme' | 'vivid-lesson') => void;
    processingState?: ProcessingState;
    onRetry?: () => void;
    onContactSupport?: () => void;
    onReturnToDashboard?: () => void;
}

/* ================= MAIN ================= */

export default function CognitiveEngineModal({
    isOpen,
    onClose,
    file,
    onProcessingSelect,
    processingState = 'idle',
    onRetry,
    onContactSupport,
    onReturnToDashboard,
}: CognitiveEngineModalProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    if (!isOpen || !file) return null;

    // Show processing states when not idle
    if (processingState !== 'idle') {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <ProcessingStates
                    state={processingState === 'processing' ? 'processing' : processingState === 'success' ? 'success' : 'error'}
                    fileName={file.name}
                    onRetry={onRetry}
                    onContactSupport={onContactSupport}
                    onReturnToDashboard={onReturnToDashboard}
                />
            </div>
        );
    }

    const fileCategory = getFileCategory(file.type);
    const availableOptions = getAvailableOptions(fileCategory);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        onProcessingSelect(option as any);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <div className="w-[720px] max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-[#0B1220] to-[#070d1f] p-6 shadow-[0_0_80px_rgba(34,211,238,0.08)]">

                <ModalHeader onClose={onClose} />

                <FileInfoCard file={file} category={fileCategory} />

                <OptionsList
                    selectedOption={selectedOption}
                    availableOptions={availableOptions}
                    onSelect={handleOptionClick}
                />

                <ModalFooter onClose={onClose} />
            </div>
        </div>
    );
}

/* ================= HEADER ================= */

function ModalHeader({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                    Initialize Cognitive Engine
                </h2>
                <p className="text-sm text-[#6B7280] max-w-md">
                    Select an operation to refine your current knowledge vector.
                </p>
            </div>

            <button onClick={onClose} className="text-[#6B7280] hover:text-white">
                <X />
            </button>
        </div>
    );
}

/* ================= FILE CARD ================= */

function FileInfoCard({
    file,
    category,
}: {
    file: FileMetadata;
    category: string;
}) {
    return (
        <div className="mb-6 p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl">
            <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                    <FileIcon type={file.type} />
                </div>

                <div className="flex-1">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs text-[#6B7280]">
                        {file.type} • {formatFileSize(file.size)}
                    </p>
                </div>

                <div className="px-2 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded">
                    {category.toUpperCase()}
                </div>

            </div>
        </div>
    );
}

/* ================= OPTIONS ================= */

function OptionsList({
    selectedOption,
    availableOptions,
    onSelect,
}: any) {
    return (
        <div className="space-y-4">

            <OptionCard
                icon={<BrainCircuit />}
                title="Generate Quiz"
                desc="Auto-extracted knowledge validation markers"
                metric="PRECISION"
                width="70%"
                isAvailable={availableOptions.includes('quiz')}
                isSelected={selectedOption === 'quiz'}
                onClick={() => onSelect('quiz')}
            />

            <OptionCard
                icon={<DraftingCompass />}
                title="Draft Study Scheme"
                desc="Strategic roadmap for long-term retention"
                metric="DEPTH"
                width="55%"
                isAvailable={availableOptions.includes('study-scheme')}
                isSelected={selectedOption === 'study-scheme'}
                onClick={() => onSelect('study-scheme')}
            />

            <OptionCard
                icon={<Sparkles />}
                title="Vivid Lesson"
                desc="Interactive narrative with immersive context"
                metric="CLARITY"
                width="80%"
                isAvailable={availableOptions.includes('vivid-lesson')}
                isSelected={selectedOption === 'vivid-lesson'}
                onClick={() => onSelect('vivid-lesson')}
            />

        </div>
    );
}

/* ================= FOOTER ================= */

function ModalFooter({ onClose }: { onClose: () => void }) {
    return (
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">

            <div className="text-[10px] tracking-widest text-[#6B7280] uppercase">
                ⚡ Engine Status: Optimized
            </div>

            <div className="flex items-center gap-4">
                <button onClick={onClose} className="text-sm text-[#9CA3AF] hover:text-white">
                    Cancel
                </button>

                <button className="px-4 py-2 text-sm rounded-lg bg-[#111827] border border-[#1F2937] hover:bg-white/5 text-white">
                    Advanced Settings
                </button>
            </div>

        </div>
    );
}

/* ================= OPTION CARD ================= */

function OptionCard({
    icon,
    title,
    desc,
    metric,
    width,
    isAvailable,
    isSelected,
    onClick,
}: any) {
    if (!isAvailable) {
        return (
            <div className="opacity-50 cursor-not-allowed bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex justify-between">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-[#1E293B] rounded-lg flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <p className="text-[#6B7280]">{title}</p>
                        <p className="text-xs text-[#4B5563]">{desc}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`flex justify-between items-center p-5 rounded-xl border cursor-pointer transition
            ${isSelected ? 'border-cyan-400 bg-cyan-400/5' : 'border-[#1E293B] hover:border-cyan-400/40'}`}
        >
            <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-cyan-400/10 text-cyan-400 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <p className="text-white">{title}</p>
                    <p className="text-xs text-[#6B7280]">{desc}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[10px] text-cyan-400">{metric}</p>
                    <div className="w-32 h-[3px] bg-[#020617]">
                        <div style={{ width }} className="h-full bg-cyan-400" />
                    </div>
                </div>
                <ChevronRight className="text-[#6B7280]" />
            </div>
        </div>
    );
}

/* ================= HELPERS ================= */

const FILE_TYPE_COMPATIBILITY = {
    document: ['pdf', 'doc', 'docx', 'txt', 'md'],
    spreadsheet: ['xlsx', 'csv', 'xls'],
    image: ['jpeg', 'jpg', 'png'],
    audio: ['mp3', 'wav'],
    video: ['mp4', 'mov'],
};

function getFileCategory(fileType: string): string {
    const ext = fileType.split('.').pop() || '';
    for (const key in FILE_TYPE_COMPATIBILITY) {
        if (FILE_TYPE_COMPATIBILITY[key as keyof typeof FILE_TYPE_COMPATIBILITY].includes(ext)) {
            return key;
        }
    }
    return 'unknown';
}

function getAvailableOptions(category: string): string[] {
    if (['document', 'spreadsheet'].includes(category)) return ['quiz', 'study-scheme', 'vivid-lesson'];
    if (category === 'image') return ['quiz', 'vivid-lesson'];
    if (['audio', 'video'].includes(category)) return ['vivid-lesson'];
    return ['quiz', 'study-scheme', 'vivid-lesson'];
}

function formatFileSize(bytes: number) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function FileIcon({ type }: { type: string }) {
    return <BrainCircuit size={20} />;
}
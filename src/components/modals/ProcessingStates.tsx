'use client';
import React from 'react';
import {
    Check, AlertTriangle, Loader2, RefreshCcw, Headphones
} from 'lucide-react';

type State = 'processing' | 'success' | 'error';

interface ProcessingStatesProps {
    state?: State;
    fileName?: string;
    onOpenLesson?: () => void;
    onGoToVault?: () => void;
    onRetry?: () => void;
    onContactSupport?: () => void;
    onReturnToDashboard?: () => void;
}

export default function ProcessingStates({
    state = 'processing',
    fileName = 'document.pdf',
    onOpenLesson,
    onGoToVault,
    onRetry,
    onContactSupport,
    onReturnToDashboard,
}: ProcessingStatesProps) {
    return (
        <div className="min-h-screen w-full bg-[#070d1f] flex items-center justify-center text-white relative overflow-hidden">

            {/* subtle radial glow */}
            <div className="absolute w-[800px] h-[800px] bg-cyan-500/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            {state === 'processing' && <Processing fileName={fileName} />}
            {state === 'success' && <Success onOpenLesson={onOpenLesson} onGoToVault={onGoToVault} />}
            {state === 'error' && <Error fileName={fileName} onRetry={onRetry} onContactSupport={onContactSupport} onReturnToDashboard={onReturnToDashboard} />}

        </div>
    );
}

/* ================= PROCESSING STATE ================= */

function Processing({ fileName }: { fileName: string }) {
    return (
        <div className="flex items-center gap-20">

            {/* LEFT - CIRCLE */}
            <div className="relative flex flex-col items-center">

                <div className="w-64 h-64 rounded-full border border-cyan-400/20 flex items-center justify-center relative">

                    {/* spinning ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />

                    <div className="w-40 h-40 rounded-2xl bg-[#111827] border border-[#1f2937] flex items-center justify-center">
                        <Loader2 className="text-cyan-400 animate-pulse" size={40} />
                    </div>
                </div>

                <div className="mt-4 text-sm bg-[#111827] px-4 py-1 rounded-full border border-[#1f2937]">
                    70%
                </div>

                <h2 className="mt-10 text-3xl font-semibold">
                    Vectorizing document
                </h2>

                <div className="mt-4 text-sm bg-[#0f172a] border border-[#1f2937] px-4 py-2 rounded-lg">
                    {fileName}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-[360px] bg-[#0f172a] border border-[#1f2937] rounded-2xl p-6 space-y-6">

                <div>
                    <h3 className="text-lg font-semibold">Processing Pipeline</h3>
                    <p className="text-xs text-gray-400 tracking-widest mt-1">
                        NEURAL ENGINE V4.2 • STABLE
                    </p>
                </div>

                <PipelineItem label="Extracting semantic layers..." status="complete" />
                <PipelineItem label="Mapping knowledge nodes..." status="active" />
                <PipelineItem label="Synthesizing Vivid Lesson..." status="pending" />

                <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>ENGINE TEMPERATURE</span>
                        <span className="text-cyan-400">OPTIMAL</span>
                    </div>
                    <div className="h-1 bg-black rounded-full">
                        <div className="w-[70%] h-1 bg-cyan-400 rounded-full" />
                    </div>
                </div>

            </div>
        </div>
    );
}

/* ================= SUCCESS STATE ================= */

function Success({ 
    onOpenLesson, 
    onGoToVault 
}: { 
    onOpenLesson?: () => void;
    onGoToVault?: () => void;
}) {
    return (
        <div className="w-[520px] bg-[#0f172a] border border-[#1f2937] rounded-2xl p-10 text-center shadow-[0_0_80px_rgba(34,211,238,0.08)]">

            <div className="w-16 h-16 mx-auto rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-6">
                <Check size={28} />
            </div>

            <h2 className="text-3xl font-semibold mb-3">
                Synthesis Complete
            </h2>

            <p className="text-gray-400 mb-8">
                Vivid Lesson and 15 Quiz items have been successfully generated from your document.
            </p>

            <div className="flex justify-center gap-4 mb-10">
                <button 
                    onClick={onOpenLesson}
                    className="px-6 py-3 rounded-lg bg-cyan-400 text-black font-medium hover:opacity-90"
                >
                    Open Lesson
                </button>

                <button 
                    onClick={onGoToVault}
                    className="px-6 py-3 rounded-lg border border-[#1f2937] hover:bg-white/5"
                >
                    Go to The Vault
                </button>
            </div>

            <div className="flex justify-between text-sm text-gray-400 border-t border-white/5 pt-6">
                <div>
                    <p className="text-xs tracking-widest mb-1">PROCESSING TIME</p>
                    <p className="text-cyan-400">1.2s</p>
                </div>

                <div>
                    <p className="text-xs tracking-widest mb-1">KNOWLEDGE DENSITY</p>
                    <p className="text-cyan-400">98.4%</p>
                </div>
            </div>

        </div>
    );
}

/* ================= ERROR STATE ================= */

function Error({ 
    fileName, 
    onRetry, 
    onContactSupport, 
    onReturnToDashboard 
}: { 
    fileName: string;
    onRetry?: () => void;
    onContactSupport?: () => void;
    onReturnToDashboard?: () => void;
}) {
    return (
        <div className="w-[620px] bg-[#0f172a] border border-[#1f2937] rounded-2xl p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-xl bg-red-400/10 flex items-center justify-center text-red-400 mb-6">
                <AlertTriangle />
            </div>

            <h2 className="text-3xl font-semibold mb-3">
                Ingestion Halted
            </h2>

            <div className="inline-block text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 mb-6">
                SYSTEM FAULT: 403-FORMAT
            </div>

            <p className="text-gray-400 mb-8">
                We encountered a problem while processing{" "}
                <span className="text-cyan-400">"{fileName}"</span>. The document format is unsupported or the file is corrupted.
            </p>

            {/* INFO CARDS */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <InfoCard title="DETECTED ISSUE" value="Header Mismatch" />
                <InfoCard title="SOURCE ORIGIN" value="Local Filesystem" />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-center gap-4 mb-8">
                <button 
                    onClick={onRetry}
                    className="px-6 py-3 rounded-lg bg-cyan-400 text-black font-medium flex items-center gap-2"
                >
                    <RefreshCcw size={16} />
                    Retry Upload
                </button>

                <button 
                    onClick={onContactSupport}
                    className="px-6 py-3 rounded-lg border border-[#1f2937] flex items-center gap-2"
                >
                    <Headphones size={16} />
                    Contact Support
                </button>
            </div>

            <p 
                onClick={onReturnToDashboard}
                className="text-sm text-gray-500 hover:text-white cursor-pointer"
            >
                ← Return to Dashboard
            </p>

        </div>
    );
}

/* ================= HELPER COMPONENTS ================= */

function PipelineItem({
    label,
    status,
}: {
    label: string;
    status: 'complete' | 'active' | 'pending';
}) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <div
                className={`w-4 h-4 mt-1 rounded-full flex items-center justify-center
                ${
                    status === 'complete'
                        ? 'bg-cyan-400'
                        : status === 'active'
                        ? 'border border-cyan-400 animate-pulse'
                        : 'bg-gray-700'
                }`}
            />
            <div>
                <p>{label}</p>
                <p className="text-xs text-gray-400">
                    {status === 'complete' && 'Complete'}
                    {status === 'active' && 'Active'}
                    {status === 'pending' && 'Pending'}
                </p>
            </div>
        </div>
    );
}

function InfoCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4 text-left">
            <p className="text-xs text-gray-400 tracking-widest mb-2">{title}</p>
            <p className="text-white">{value}</p>
        </div>
    );
}

'use client';
import React, { useState } from 'react';
import { X, Upload, Globe, Cpu, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

export default function NewAnalysisModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [step, setStep] = useState(1);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#070d1f]/95 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0c1324] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#151b2d]/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#22d3ee]/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-[#22d3ee]" fill="currentColor" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#dce1fb] italic">Neural Sync</h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-[#bbc9cd]" /></button>
                </div>

                {/* Content */}
                <div className="p-12 min-h-[350px]">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                            <SourceCard icon={Upload} title="Local Files" desc="PDF, MD, JSON" onClick={() => setStep(2)} />
                            <SourceCard icon={Globe} title="Web Intelligence" desc="URL Crawling" onClick={() => setStep(2)} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right-4">
                            <div className="w-full bg-[#151b2d]/50 border-2 border-dashed border-[#22d3ee]/30 rounded-3xl p-16 flex flex-col items-center group cursor-pointer hover:bg-[#22d3ee]/5 transition-all">
                                <Upload className="w-12 h-12 text-[#22d3ee] mb-6 animate-bounce" />
                                <p className="text-lg font-black uppercase italic tracking-tighter">Ready for Sync</p>
                                <p className="text-[10px] text-[#bbc9cd] uppercase mt-2 tracking-[0.2em] font-bold">Max 500MB per dataset</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-[#22d3ee]/20 blur-3xl animate-pulse" />
                                <Cpu className="w-20 h-20 text-[#22d3ee] animate-spin-slow relative" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Neural Engine Initialized</h3>
                            <p className="text-xs text-[#bbc9cd] font-bold uppercase tracking-widest opacity-60">Building semantic nodes...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-[#151b2d]/30 border-t border-white/5 flex justify-between items-center px-12">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#bbc9cd]">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" /> AES-256 Protected
                    </div>
                    <div className="flex gap-4">
                        {step > 1 && <button onClick={() => setStep(step - 1)} className="text-[10px] font-black uppercase tracking-widest px-6">Back</button>}
                        <button
                            onClick={() => step < 3 ? setStep(step + 1) : onClose()}
                            className="px-10 py-3 bg-[#22d3ee] text-[#00363e] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20"
                        >
                            {step === 3 ? 'Start Ingestion' : 'Next Phase'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SourceCard({ icon: Icon, title, desc, onClick }: any) {
    return (
        <button onClick={onClick} className="p-8 bg-[#151b2d] border border-white/5 rounded-3xl text-left hover:border-[#22d3ee]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0c1324] flex items-center justify-center mb-6 group-hover:bg-[#22d3ee] group-hover:text-[#00363e] transition-all">
                <Icon className="w-6 h-6 text-[#22d3ee] group-hover:text-[#00363e]" />
            </div>
            <h4 className="text-sm font-black uppercase italic tracking-tighter mb-1">{title}</h4>
            <p className="text-[10px] text-[#bbc9cd] font-bold tracking-widest uppercase opacity-40">{desc}</p>
        </button>
    );
}
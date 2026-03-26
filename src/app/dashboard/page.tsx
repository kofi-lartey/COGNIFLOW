'use client';
import React, { useState, useCallback } from 'react';
import {
    Search, Bell, Activity,
    FileText, MoreHorizontal, Settings
} from 'lucide-react';
import FileUploader, { FileMetadata } from '@/components/upload/FileUploader';
import CognitiveEngineModal, { ProcessingState } from '@/components/modals/CognitiveEngineModal';
import NeuralActivityTable from '@/components/neural/NeuralActivityTable';
import SystemHealth from '@/components/neural/SystemHealth';
import { useNeuralProcessor } from '@/hooks/useNeuralProcessor';
import type { NeuralFileItem } from '@/hooks/useNeuralProcessor';

type FileItem = {
    id: number;
    name: string;
    status: 'ANALYZING' | 'VECTORIZING' | 'COMPLETE';
    time: string;
};

export default function CommandCenter() {
    // Use the neural processor hook for state management
    const neuralProcessor = useNeuralProcessor();
    const { files: neuralFiles, progress, status, message } = neuralProcessor;

    // Convert neural files to the format expected by the UI
    // If no files are available, show empty state
    const files: FileItem[] = neuralFiles.length > 0 
        ? neuralFiles.map(f => ({
            id: parseInt(f.id.split('-')[1]) || Math.random() * 1000,
            name: f.name,
            status: f.status === 'COMPLETE' ? 'COMPLETE' : 
                   f.status === 'ANALYZING' ? 'ANALYZING' : 'VECTORIZING',
            time: f.processingTime 
                ? `${Math.floor(f.processingTime / 60000).toString().padStart(2, '0')}:${Math.floor((f.processingTime % 60000) / 1000).toString().padStart(2, '0')}`
                : '00:00:00'
          }))
        : [];

    const [query, setQuery] = useState('');
    
    // State for modal and upload management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<FileMetadata | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [processingState, setProcessingState] = useState<ProcessingState>('idle');

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase())
    );

    // Handle file upload completion
    const handleUploadComplete = useCallback((file: FileMetadata) => {
        setUploadedFile(file);
        setUploadStatus('success');
        
        // Automatically open the cognitive engine modal after successful upload
        setTimeout(() => {
            setIsModalOpen(true);
        }, 500); // Brief delay to show success state
    }, []);

    // Handle upload error
    const handleUploadError = useCallback(() => {
        setUploadStatus('error');
    }, []);

    // Handle modal close
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        // Reset state after modal closes
        setTimeout(() => {
            setUploadedFile(null);
            setUploadStatus('idle');
            setProcessingState('idle');
        }, 300);
    }, []);

    // Handle processing option selection
    const handleProcessingSelect = useCallback((option: 'quiz' | 'study-scheme' | 'vivid-lesson') => {
        console.log('Selected processing option:', option);
        console.log('File:', uploadedFile);
        
        // Start processing - show the processing state
        setProcessingState('processing');
        
        // Simulate processing completion (in real app, this would be from backend)
        // For demo purposes, we'll simulate success after some time
        setTimeout(() => {
            // 90% chance of success, 10% chance of error for demo
            const isSuccess = Math.random() > 0.1;
            setProcessingState(isSuccess ? 'success' : 'error');
        }, 3000);
    }, [uploadedFile]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setProcessingState('processing');
        // Simulate processing again
        setTimeout(() => {
            const isSuccess = Math.random() > 0.1;
            setProcessingState(isSuccess ? 'success' : 'error');
        }, 3000);
    }, []);

    // Handle contact support
    const handleContactSupport = useCallback(() => {
        // Open support modal or redirect
        alert('Contact Support clicked');
    }, []);

    // Handle return to dashboard
    const handleReturnToDashboard = useCallback(() => {
        handleModalClose();
    }, [handleModalClose]);

    // Handle open lesson (success state)
    const handleOpenLesson = useCallback(() => {
        alert('Opening Lesson...');
        handleModalClose();
    }, [handleModalClose]);

    // Handle go to vault (success state)
    const handleGoToVault = useCallback(() => {
        alert('Navigating to Vault...');
        handleModalClose();
    }, [handleModalClose]);

    return (
        <main className="flex-1 flex flex-col bg-[#050A18] text-white">
            <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-[#0B1220]/60 backdrop-blur-xl">

                {/* LEFT NAV */}
                <div className="flex items-center gap-10">
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-[#6B7280]">
                        <span className="text-cyan-400 border-b-2 border-cyan-400 pb-6">Dashboard</span>
                        <span className="hover:text-white cursor-pointer">Docs</span>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-6">

                    {/* SEARCH */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-[#6B7280]" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search the vault..."
                            className="bg-[#0D1628] border border-[#1E293B] rounded-lg pl-10 pr-4 py-2 text-xs w-72 outline-none focus:border-cyan-400/40"
                        />
                    </div>

                    {/* ICONS */}
                    <div className="flex items-center gap-4">
                        <Bell className="w-5 h-5 text-[#6B7280] cursor-pointer hover:text-white transition" />
                        <Settings className="w-5 h-5 text-[#6B7280] cursor-pointer hover:text-white transition" />
                    </div>

                    {/* USER */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#0B1220] flex items-center justify-center text-xs font-bold text-cyan-400">
                            JD
                        </div>
                    </div>

                </div>
            </header>

            {/* CONTENT */}
            <div className="p-10 space-y-10">

                {/* TITLE ROW */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2">Command Center</h1>
                        <p className="text-[#6B7280] text-sm max-w-xl">
                            Unified interface for neural document processing and knowledge graph visualization.
                        </p>
                    </div>

                    {/* METRIC */}
                    <div className="bg-[#0D1628] border border-[#1E293B] rounded-xl px-6 py-4 flex items-center gap-4">
                        <div>
                            <p className="text-[10px] tracking-widest text-[#6B7280] uppercase">Active Insights</p>
                            <p className="text-2xl font-bold text-cyan-400">{neuralFiles.filter(f => f.status === 'COMPLETE').length || '0'}</p>
                        </div>
                        <Activity className="text-cyan-400" />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">

                    {/* FILE UPLOADER */}
                    <div className="col-span-8">
                        <FileUploader 
                            onUploadComplete={handleUploadComplete}
                            maxFileSize={500 * 1024 * 1024} // 500MB
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-4 space-y-6">

                        {/* SYSTEM HEALTH */}
                        <SystemHealth 
                            neuralLoad={12} 
                            apiLatency={24} 
                            processingProgress={neuralFiles.length > 0 ? progress : 0}
                            showDetails={true}
                        />

                        {/* GRAPH CARD */}
                        <div className="bg-[#0D1628] border border-[#1E293B] rounded-xl p-6">
                            <p className="text-sm mb-2">Neural Connection Map</p>
                            <p className="text-xs text-[#6B7280] mb-4">
                                {neuralFiles.length > 0 
                                    ? `Visualizing ${neuralFiles.length * 50 || 0} semantic relationships` 
                                    : 'Upload documents to visualize semantic relationships'}
                            </p>
                            <button className="w-full py-2 border border-[#1E293B] rounded-lg text-xs">
                                EXPAND VISUALIZATION
                            </button>
                        </div>
                    </div>

                    {/* NEURAL ACTIVITY TABLE */}
                    <div className="col-span-12">
                        <NeuralActivityTable 
                            files={neuralFiles.length > 0 ? neuralFiles.map(f => ({
                                id: f.id,
                                name: f.name,
                                type: f.type,
                                status: f.status,
                                progress: f.progress,
                                message: f.message,
                                uploadedAt: f.uploadedAt,
                                processingTime: f.processingTime,
                                result: f.result,
                                learningPath: f.learningPath,
                                error: f.error
                            })) : undefined}
                            maxDisplay={10}
                            showFilters={true}
                        />
                    </div>
                </div>
            </div>

            {/* COGNITIVE ENGINE MODAL */}
            <CognitiveEngineModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                file={uploadedFile}
                onProcessingSelect={handleProcessingSelect}
                processingState={processingState}
                onRetry={handleRetry}
                onContactSupport={handleContactSupport}
                onReturnToDashboard={handleReturnToDashboard}
            />
        </main>
    );
}

/* COMPONENTS */

function Stat({ label, value, width }: { label: string; value: string; width: string }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-[#6B7280]">{label}</span>
                <span className="text-cyan-400">{value}</span>
            </div>
            <div className="h-1 bg-[#020617] rounded">
                <div style={{ width }} className="h-1 bg-cyan-400 rounded" />
            </div>
        </div>
    );
}

function Row({ file }: { file: FileItem }) {
    return (
        <tr className="border-b border-[#1E293B] hover:bg-white/5">
            <td className="px-6 py-4 flex items-center gap-3">
                <FileText size={16} />
                {file.name}
            </td>

            <td className="px-6 py-4">
                <Status status={file.status} />
            </td>

            <td className="px-6 py-4 text-[#6B7280]">
                {file.time}
            </td>

            <td className="px-6 py-4 text-right">
                <MoreHorizontal className="text-[#6B7280]" />
            </td>
        </tr>
    );
}

function Status({ status }: { status: string }) {
    const styles: Record<string, string> = {
        COMPLETE: 'bg-emerald-400/10 text-emerald-400',
        ANALYZING: 'bg-purple-400/10 text-purple-400',
        VECTORIZING: 'bg-cyan-400/10 text-cyan-400',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
            {status}
        </span>
    );
}

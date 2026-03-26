'use client';
import React, { useState } from 'react';
import {
    LayoutDashboard, ShieldCheck, Zap, CreditCard,
    History, Settings, LogOut, HelpCircle,
    Sparkles, Plus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NewAnalysisModal from "@/components/modals/NewAnalysisModal";

const menuItems = [
    { name: '1. Command Center', icon: LayoutDashboard, href: '/dashboard' },
    { name: '2. Vault', icon: ShieldCheck, href: '/dashboard/vault' },
    { name: '3. AI Insight', icon: Zap, href: '/dashboard/insights' },
    { name: '4. Subscription', icon: CreditCard, href: '/dashboard/subscription' },
    { name: '5. Payment History', icon: History, href: '/dashboard/history' },
    { name: '6. Preferences', icon: Settings, href: '/dashboard/preferences' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    return (
        <>
            <aside className="w-64 bg-[#0D101A] border-r border-[#1E253A] flex flex-col h-screen sticky top-0 z-50 shadow-2xl">
                {/* Brand Logo */}
                <div className="p-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/20">
                        <Sparkles className="text-[#090B13] w-5 h-5" fill="currentColor" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase italic">CogniFlow</span>
                </div>

                {/* Primary Action: New Analysis */}
                <div className="px-4 mb-8">
                    <button
                        onClick={() => setIsAnalysisOpen(true)}
                        className="w-full py-4 bg-cyan-400 text-[#090B13] rounded-xl font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(34,211,238,0.3)]"
                    >
                        <Plus className="w-4 h-4" strokeWidth={4} />
                        New Analysis
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 space-y-1.5">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${isActive
                                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                                    : "text-[#4B5563] hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "opacity-50"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 mt-auto space-y-4">
                    {/* Usage Card */}
                    <div className="bg-[#111421] p-5 rounded-2xl border border-[#1E253A] shadow-inner">
                        <div className="flex justify-between text-[9px] uppercase tracking-[0.25em] mb-3 font-black">
                            <span className="text-[#4B5563]">Vault Capacity</span>
                            <span className="text-white">72%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#090B13] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 w-[72%] shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all duration-700" />
                        </div>
                        <p className="text-[9px] text-[#4B5563] mt-3 font-bold uppercase tracking-widest text-center">7.2GB of 10GB Used</p>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex flex-col gap-1 pb-4">
                        <button className="flex items-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#4B5563] hover:text-white transition-colors">
                            <HelpCircle className="w-4 h-4" /> Support
                        </button>
                        <button className="flex items-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#4B5563] hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modal instance controlled by the sidebar button */}
            <NewAnalysisModal
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
            />
        </>
    );
}
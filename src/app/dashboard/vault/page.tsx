'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, Filter, Plus, Calendar, FileText, 
  Layers, Brain, Zap, Globe, ShieldCheck
} from "lucide-react";

// Vault entries - should be fetched from API/database
const VAULT_ENTRIES: Array<{
  id: number;
  title: string;
  type: string;
  date: string;
  source: string;
  image: string;
  btnText: string;
}> = [];

// Navigation helper function
const getNavigationPath = (type: string, item: typeof VAULT_ENTRIES[0]): string => {
  // Encode the source document as a query parameter for quiz generation
  const sourceParam = encodeURIComponent(item.source);
  const titleParam = encodeURIComponent(item.title);
  const idParam = item.id.toString();
  
  switch (type) {
    case "QUIZ":
      return `/dashboard/quiz?source=${sourceParam}&title=${titleParam}&id=${idParam}`;
    case "STUDY SCHEME":
      return `/dashboard/study-scheme?source=${sourceParam}&title=${titleParam}&id=${idParam}`;
    case "VIVID LESSON":
      return `/dashboard/lesson?source=${sourceParam}&title=${titleParam}&id=${idParam}`;
    default:
      return "/dashboard";
  }
};

const VaultCard = ({ item, index }: { item: typeof VAULT_ENTRIES[0], index: number }) => {
  const router = useRouter();
  
  const handleClick = () => {
    const path = getNavigationPath(item.type, item);
    router.push(path);
  };
  
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-[#0B1221]/40 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-500 flex flex-col h-full cursor-pointer"
    onClick={handleClick}
  >
    <div className="relative h-40 shrink-0 overflow-hidden">
      <img src={item.image} alt="" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] to-transparent" />
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md">
        {item.type === "QUIZ" && <Zap size={10} className="text-cyan-400" />}
        {item.type === "STUDY SCHEME" && <Layers size={10} className="text-cyan-400" />}
        {item.type === "VIVID LESSON" && <Brain size={10} className="text-cyan-400" />}
        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase">{item.type}</span>
      </div>
    </div>

    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-bold text-white mb-4 tracking-tight leading-tight group-hover:text-cyan-400 transition-colors">
        {item.title}
      </h3>
      <div className="space-y-1.5 mb-6 flex-1">
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={12} />
          <span className="text-[10px] font-medium">{item.date}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <FileText size={12} />
          <span className="text-[10px] font-mono truncate max-w-[180px]">{item.source}</span>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-cyan-400 transition-all"
      >
        {item.btnText}
      </button>
    </div>
  </motion.div>
  );
}

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const tabs = ["All Content", "Quizzes", "Study Schemes", "Vivid Lessons"];

  // Filter entries based on tab and search query
  const filteredEntries = VAULT_ENTRIES.filter(entry => {
    const matchesTab = activeTab === 0 || 
      (activeTab === 1 && entry.type === 'QUIZ') ||
      (activeTab === 2 && entry.type === 'STUDY SCHEME') ||
      (activeTab === 3 && entry.type === 'VIVID LESSON');
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-1 h-screen bg-[#01040a] text-slate-400 flex flex-col font-sans overflow-hidden">
      
      {/* 1. Nav Header */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Globe className="text-slate-950 w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-md font-black tracking-tighter italic uppercase">CogniFlow</span>
            <span className="text-[7px] text-cyan-500/50 font-mono tracking-[0.4em] uppercase">The_Vault_v.2</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
             <div className="text-right">
                <span className="block text-[8px] text-slate-600 uppercase tracking-widest">Total_Entries</span>
                <span className="text-xs font-bold text-white">{filteredEntries.length}</span>
             </div>
             <div className="text-right border-l border-white/10 pl-4">
                <span className="block text-[8px] text-slate-600 uppercase tracking-widest">Capacity</span>
                <span className="text-xs font-bold text-white">84%</span>
             </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />
        </div>
      </nav>

      {/* 2. Main Scrollable Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-10">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab, i) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(i)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === i ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20 shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex w-full lg:w-auto gap-3">
              <div className="relative flex-1 lg:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  type="text" 
                  placeholder="Query knowledge vault..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-[10px] font-mono focus:outline-none focus:border-cyan-500/40 transition-all uppercase tracking-tighter"
                />
              </div>
              <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-cyan-400 transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((item, index) => (
                <VaultCard key={item.id} item={item} index={index} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <Globe size={32} className="text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No vault entries yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md">
                  Upload documents to your vault to generate quizzes, study schemes, and vivid lessons.
                </p>
                <a 
                  href="/dashboard" 
                  className="px-6 py-3 bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all"
                >
                  Start Generating
                </a>
              </div>
            )}

            {/* --- CONNECTED GENERATE BUTTON --- */}
            <motion.a
              href="/dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="block h-full group cursor-pointer"
            >
              <motion.div
                className="h-full min-h-[320px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02] group-hover:border-cyan-500/30 group-hover:bg-cyan-500/[0.03] transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-500 shadow-2xl">
                  <Plus size={28} />
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Generate New Content</h4>
                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest text-center">
                  Initialize link to<br />synthesis dashboard
                </p>
              </motion.div>
            </motion.a>
          </div>
        </div>
      </main>

      {/* 3. Status Footer */}
      <footer className="w-full py-3 px-8 flex justify-between items-center border-t border-white/5 bg-[#01040a] shrink-0 z-20">
        <div className="flex items-center gap-2">
           <ShieldCheck size={12} className="text-cyan-500" />
           <span className="text-[8px] font-mono tracking-[0.4em] uppercase text-slate-600">Access_Level: Administrator</span>
        </div>
        <div className="flex items-center gap-4 text-[8px] font-mono text-slate-800">
           <span>DB_UPTIME: 99.9%</span>
           <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-pulse" />
        </div>
      </footer>
    </div>
  );
}

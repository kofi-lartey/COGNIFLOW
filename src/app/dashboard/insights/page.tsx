'use client';
import React, { useState } from 'react';
import { 
  Search, Bell, Sparkles, Plus, 
  Send, Mic, Paperclip, FileText, 
  ThumbsUp, ThumbsDown, Copy, Globe,
  Cpu, Zap, X, ChevronDown, Network
} from 'lucide-react';

export default function AIInsights() {
  const [query, setQuery] = useState("");
  const [expandedVector, setExpandedVector] = useState<string | null>(null);

  const toggleVector = (vectorId: string) => {
    setExpandedVector(expandedVector === vectorId ? null : vectorId);
  };

  return (
    <main className="flex-1 flex flex-col h-screen bg-[#070d1f] text-[#dce1fb] overflow-hidden">
      {/* 1. HEADER SECTION */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0c1324]/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black uppercase tracking-widest italic text-white">Obsidian AI</h2>
          <div className="flex gap-2">
            <ContextTag label="Quantum Physics" />
            <ContextTag label="Global Economics" />
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-400/30 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-400/10 transition-all">
              <Plus className="w-3 h-3" strokeWidth={3} /> Inject Context
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] group-focus-within:text-cyan-400" />
              <input placeholder="Search knowledge graph..." className="bg-[#0D101A] border border-[#1E253A] rounded-xl py-2 pl-12 pr-6 text-xs w-64 focus:border-cyan-400/40 outline-none" />
           </div>
           <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-[#4B5563] cursor-pointer hover:text-white" />
              <div className="text-right">
                 <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">Dr. Aris Thorne</p>
                 <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Tier: Obsidian Elite</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-[#005574] p-[2px]">
                 <div className="w-full h-full rounded-[10px] bg-[#0c1324] flex items-center justify-center font-bold text-cyan-400 text-xs text-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aris" alt="avatar" />
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* 2. CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
        {/* User Query Message */}
        <div className="flex flex-col items-end gap-2 max-w-4xl ml-auto animate-in slide-in-from-right-4">
           <div className="bg-[#151b2d] border border-white/5 p-6 rounded-2xl rounded-tr-none shadow-xl">
              <p className="text-sm leading-relaxed text-[#bbc9cd]">
                 Can you cross-reference these biological quantum effects with the recent findings in Global Economics regarding bio-inspired computation efficiency?
              </p>
           </div>
           <span className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest px-2">14:22 • Sent by you</span>
        </div>

        {/* AI Response Card */}
        <div className="max-w-5xl animate-in slide-in-from-left-4">
           <div className="flex gap-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                 <Sparkles className="w-5 h-5 text-[#090B13]" fill="currentColor" />
              </div>
              
              <div className="flex-1 space-y-6">
                 <div className="bg-[#0c1324] border border-white/10 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
                    
                    <div className="flex items-center gap-3 mb-6">
                       <Zap className="w-5 h-5 text-cyan-400" fill="currentColor" />
                       <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Synergistic Analysis</h3>
                    </div>

                    <p className="text-[#bbc9cd] leading-relaxed mb-8">
                       The convergence of subatomic biological phenomena and economic computational modeling reveals a significant shift in how we value efficiency. Specifically, <span className="text-white font-bold">quantum coherence in photosynthesis</span> is now being mapped to <span className="text-white font-bold">high-frequency trading liquidity models</span> to minimize latency through 'stochastic resonance'.
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                       <VectorCard 
                          label="Biological Vector" 
                          content="Coherent energy transfer in light-harvesting complexes achieves nearly 100% quantum efficiency."
                          vectorId="biological"
                          isExpanded={expandedVector === 'biological'}
                          onToggle={() => toggleVector('biological')}
                       />
                       <VectorCard 
                          label="Economic Vector" 
                          content="Bio-inspired algorithms reducing operational overhead by 14.2% in decentralized ledger settlements."
                          vectorId="economic"
                          isExpanded={expandedVector === 'economic'}
                          onToggle={() => toggleVector('economic')}
                       />
                    </div>

                    <p className="text-[#bbc9cd] leading-relaxed mb-10">
                       This "Bio-Quantum Economic" parity suggests that institutional frameworks may soon adopt non-linear processing cycles that mimic biological repair mechanisms to withstand market volatility.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-white/5">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4B5563]">Citations:</span>
                       <SourceBadge name="Source: QM_Bio_Review.pdf" />
                       <SourceBadge name="Source: Econ_Impact_V4.pdf" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between px-6">
                    <span className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">14:23 • Generated by Obsidian Core</span>
                    <div className="flex gap-4">
                       <ActionIcon icon={ThumbsUp} />
                       <ActionIcon icon={ThumbsDown} />
                       <ActionIcon icon={Copy} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 3. INPUT BAR */}
      <div className="p-10 shrink-0">
         <div className="max-w-5xl mx-auto relative group">
            <div className="absolute inset-0 bg-cyan-400/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative bg-[#0c1324] border border-[#1E253A] rounded-[2rem] p-4 flex items-center gap-4 shadow-2xl">
               <button className="p-3 text-[#4B5563] hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
               </button>
               <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Inquire the obsidian..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#4B5563] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:font-black"
               />
               <button className="p-3 text-[#4B5563] hover:text-white transition-colors">
                  <Mic className="w-5 h-5" />
               </button>
               <button className="bg-cyan-400 text-[#090B13] px-8 py-3 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-cyan-400/20">
                  Send <Zap className="w-4 h-4" fill="currentColor" />
               </button>
            </div>
            <p className="text-center mt-4 text-[8px] font-black uppercase tracking-[0.3em] text-[#4B5563]">Advanced Neural Processing Active • V4.2 Obsidian Prime</p>
         </div>
      </div>
    </main>
  );
}

// UI SUB-COMPONENTS
function ContextTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-[#151b2d] border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#bbc9cd] group cursor-pointer hover:border-cyan-400/30 transition-all">
      <Globe className="w-3 h-3 text-cyan-400" />
      {label}
      <span className="text-[#4B5563] hover:text-white transition-colors">×</span>
    </div>
  );
}

function VectorCard({ label, content, vectorId, isExpanded, onToggle }: { 
  label: string, 
  content: string,
  vectorId: string,
  isExpanded: boolean,
  onToggle: () => void
}) {
  return (
    <div className={`bg-[#111421] border border-white/5 rounded-2xl group hover:border-cyan-400/20 transition-all ${isExpanded ? 'col-span-2' : ''}`}>
       <div className="p-6">
          <div className="flex items-center justify-between mb-3">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">{label}</p>
             <button 
                onClick={onToggle}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0c1324] rounded-lg text-[9px] font-bold text-cyan-400 hover:bg-cyan-400/10 transition-all"
             >
                <Network className="w-3 h-3" />
                {isExpanded ? 'Hide Map' : 'Neural Map'}
                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
             </button>
          </div>
          <p className="text-xs text-[#bbc9cd] leading-relaxed">{content}</p>
       </div>
       
       {/* Neural Connection Map - Expanded View */}
       {isExpanded && (
          <div className="px-6 pb-6 animate-in slide-in-from-top-2">
             <NeuralConnectionMap vectorId={vectorId} />
          </div>
       )}
    </div>
  );
}

function NeuralConnectionMap({ vectorId }: { vectorId: string }) {
  // Different connection data based on vector type
  const connections = vectorId === 'biological' ? [
    { node: 'Photosynthesis', connections: ['Quantum Coherence', 'Energy Transfer', 'Light Harvesting'], strength: 95 },
    { node: 'Quantum Coherence', connections: ['Superposition', 'Entanglement', 'Wave Function'], strength: 88 },
    { node: 'Energy Transfer', connections: ['Electron Transport', 'ATP Synthesis', 'Metabolism'], strength: 82 },
    { node: 'Cellular Repair', connections: ['DNA Repair', 'Protein Folding', 'Apoptosis'], strength: 76 },
    { node: 'Neural Networks', connections: ['Synaptic Plasticity', 'Brain Architecture', 'Cognition'], strength: 71 },
  ] : [
    { node: 'High-Frequency Trading', connections: ['Latency Optimization', 'Liquidity Models', 'Market Microstructure'], strength: 92 },
    { node: 'Decentralized Ledgers', connections: ['Consensus Mechanisms', 'Smart Contracts', 'Token Economics'], strength: 85 },
    { node: 'Stochastic Resonance', connections: ['Signal Amplification', 'Noise Benefits', 'Non-linear Dynamics'], strength: 79 },
    { node: 'Bio-Inspired Algorithms', connections: ['Genetic Algorithms', 'Swarm Intelligence', 'Neural Networks'], strength: 83 },
    { node: 'Market Volatility', connections: ['Risk Assessment', 'Hedging Strategies', 'Portfolio Optimization'], strength: 77 },
  ];

  return (
    <div className="bg-[#0c1324] border border-cyan-400/20 rounded-xl p-4">
       <div className="flex items-center gap-2 mb-4">
          <Network className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Neural Connection Map</span>
       </div>
       
       {/* Connection Visualization */}
       <div className="relative">
          {/* Connection Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
             {connections.map((conn, i) => 
                conn.connections.map((target, j) => {
                  const targetIndex = connections.findIndex(c => c.node === target.split(' ')[0] || (target.includes(' ') && connections.some(oc => oc.node.split(' ')[0] === target.split(' ')[0])));
                  if (targetIndex === -1 || targetIndex <= i) return null;
                  const x1 = 120 + (i * 140);
                  const y1 = 60;
                  const x2 = 120 + (targetIndex * 140);
                  const y2 = 60;
                  return (
                    <line 
                      key={`${i}-${j}`}
                      x1={x1} y1={y1} 
                      x2={x2} y2={y2} 
                      stroke="rgba(34, 211, 238, 0.3)" 
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  );
                })
             )}
          </svg>
          
          {/* Node Grid */}
          <div className="grid grid-cols-5 gap-2">
             {connections.map((conn, index) => (
                <div 
                  key={index}
                  className="relative flex flex-col items-center p-2 bg-[#151b2d] rounded-lg border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group"
                  style={{ zIndex: 2 }}
                >
                   <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                      style={{ 
                         background: `linear-gradient(135deg, rgba(34, 211, 238, ${conn.strength/100}) 0%, rgba(34, 211, 238, 0.2) 100%)`,
                         boxShadow: `0 0 ${conn.strength/5}px rgba(34, 211, 238, 0.3)`
                      }}
                   >
                      <Cpu className="w-4 h-4 text-cyan-400" />
                   </div>
                   <span className="text-[8px] font-bold text-center text-[#bbc9cd] group-hover:text-white transition-colors">
                      {conn.node}
                   </span>
                   <span className="text-[7px] text-cyan-400 mt-1">{conn.strength}%</span>
                   
                   {/* Connection Tooltip */}
                   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-[#0c1324] border border-cyan-400/30 rounded-lg p-2 shadow-xl whitespace-nowrap">
                         <p className="text-[8px] font-bold text-white mb-1">Connected to:</p>
                         {conn.connections.map((c, ci) => (
                            <p key={ci} className="text-[7px] text-[#bbc9cd]">• {c}</p>
                         ))}
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
       
       {/* Legend */}
       <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[8px] text-[#4B5563]">Active Node</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-cyan-400 border-dashed" />
                <span className="text-[8px] text-[#4B5563]">Connection</span>
             </div>
          </div>
          <span className="text-[8px] text-[#4B5563]">Click nodes to explore</span>
       </div>
    </div>
  );
}

function SourceBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-cyan-400/5 border border-cyan-400/20 rounded-xl text-[10px] font-bold text-cyan-400 cursor-pointer hover:bg-cyan-400/10 transition-all">
       <FileText className="w-4 h-4" />
       {name}
    </div>
  );
}

function ActionIcon({ icon: Icon }: { icon: any }) {
  return (
    <button className="p-2 text-[#4B5563] hover:text-white transition-colors">
       <Icon className="w-4 h-4" />
    </button>
  );
}

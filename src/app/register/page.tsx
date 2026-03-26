"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Mail, Lock, User, ShieldCheck, Fingerprint, LayoutGrid, Zap, Eye, EyeOff
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Entropy (Password Strength) Logic
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length > 12) score += 1;
    return score;
  }, [password]);

  const strengthLabel = ["Insecure", "Basic", "Validated", "Secure", "Obsidian Layer"][strength - 1] || "Waiting...";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase Config Error');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    // Handle signup errors
    if (signUpError) {
      setError(signUpError.message || 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    setMessage('Sequence initiated. Check your inbox.');
    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#020617] text-slate-400 flex flex-col font-sans selection:bg-cyan-500/30">

      {/* 1. Header */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-8 py-4 w-full shrink-0 border-b border-slate-900/50"
      >
        <Link href="/" className="flex items-center gap-3 text-white cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Globe className="text-slate-950 w-5 h-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tighter italic">CogniFlow</span>
            <span className="text-[8px] text-cyan-500/60 font-mono tracking-widest uppercase">System Alpha</span>
          </div>
        </Link>
        <Link href="/login" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400 transition-all">
          <Fingerprint size={14} />
          Sign In
        </Link>
      </motion.nav>

      {/* 2. Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 p-6 rounded-3xl shadow-2xl max-w-[390px] w-full relative z-10"
        >
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 mb-3">
              <Zap size={18} className="text-cyan-500 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">Create Identity</h1>
            <p className="text-[9px] text-slate-500 tracking-[0.25em] font-medium uppercase">Initialize Neural Link</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Name & Email Inputs remain identical to previous precision style... */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">Identity Tag</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full h-10 pl-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-800" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">Access Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@cogniflow.ai" className="w-full h-10 pl-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-800" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-11 pr-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* STRENGTH METER */}
              <div className="px-1 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] uppercase tracking-widest font-black text-slate-700">Entropy Level</span>
                  <span className={`text-[8px] uppercase tracking-widest font-black transition-colors ${password ? 'text-cyan-500/80' : 'text-slate-800'}`}>{strengthLabel}</span>
                </div>
                <div className="h-1 w-full flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div key={lvl} className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= lvl ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-900'}`} />
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(error || message) && (
                <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`text-[10px] text-center font-bold tracking-wide py-1 ${error ? 'text-red-400' : 'text-cyan-400'}`}>
                  {error || message}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: '#22d3ee' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full h-11 bg-cyan-500 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : <><LayoutGrid size={14} /> Establish Connection</>}
            </motion.button>
          </form>

          <p className="text-center text-[10px] text-slate-500 mt-6 font-bold tracking-tighter">
            NODE_STATUS: <span className="text-cyan-500/80 uppercase">Awaiting Authorization</span>
          </p>
        </motion.div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full py-4 px-8 flex justify-between items-center shrink-0 border-t border-slate-900/50 opacity-20">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-cyan-500" />
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase italic">Quantum Encryption Active</span>
        </div>
        <span className="text-[9px] font-mono tracking-tighter uppercase">ID_ACR_GHA_2026</span>
      </footer>
    </div>
  );
}
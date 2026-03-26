'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Globe, Apple, Eye, EyeOff, LayoutGrid, Zap } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Neural Link Configuration Missing');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle rate limit errors (429) from Supabase
    if (signInError) {
      setError(signInError.message || 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Supabase login success
    setMessage('Authorization successful. Synchronizing...');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 p-7 rounded-3xl shadow-2xl max-w-[400px] w-full mx-auto font-sans relative z-10"
    >
      {/* Header Section */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 mb-3 shadow-inner">
          <Zap size={18} className="text-cyan-500 fill-cyan-500/10" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          Access Portal
        </h1>
        <p className="text-[10px] text-slate-500 tracking-[0.25em] font-medium uppercase">
          Verify Security Credentials
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">
            Neural Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@cogniflow.ai"
              className="w-full h-11 pl-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-slate-800"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              Security Key
            </label>
            <Link href="/forgot-password" className="text-[9px] font-bold text-cyan-500/70 hover:text-cyan-400 uppercase tracking-widest transition-colors">
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 pl-11 pr-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-500 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Messaging */}
        <AnimatePresence mode="wait">
          {(error || message) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-[10px] text-center font-bold tracking-wide py-1 ${error ? 'text-red-400' : 'text-cyan-400'}`}
            >
              {error || message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01, backgroundColor: '#22d3ee' }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-cyan-500 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Authorizing...' : <><LayoutGrid size={14} /> Establish Session</>}
        </motion.button>
      </form>

      {/* Social Section */}
      <div className="relative my-7 flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
        <span className="bg-[#0b1224] px-4 z-10 text-slate-700">OAuth Sync</span>
        <div className="absolute top-1/2 w-full border-t border-slate-900" />
      </div>

      <div className="flex gap-3">
        <button className="flex-1 h-10 flex items-center justify-center gap-2 border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 rounded-xl text-[11px] text-slate-300 font-bold transition-all group">
          <Globe className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          Google
        </button>
        <button className="flex-1 h-10 flex items-center justify-center gap-2 border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 rounded-xl text-[11px] text-slate-300 font-bold transition-all group">
          <Apple className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          Apple
        </button>
      </div>

      {/* Footer Link */}
      <p className="text-center text-[10px] text-slate-500 mt-6 font-bold tracking-tighter uppercase">
        Identity not found?{' '}
        <Link href="/register" className="text-white font-black hover:text-cyan-400 transition-colors">
          Create New Identity
        </Link>
      </p>
    </motion.div>
  );
}
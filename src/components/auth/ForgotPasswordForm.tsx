'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, LayoutGrid, Zap, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 p-7 rounded-3xl shadow-2xl max-w-[400px] w-full mx-auto font-sans relative z-10"
      >
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <CheckCircle size={28} className="text-cyan-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            Signal Dispatched
          </h1>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            A password reset link has been sent to your neural address. Check your email inbox and follow the embedded protocol to restore access.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full h-11 flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all border border-slate-700/50"
          >
            <ArrowLeft size={14} />
            Return to Access Portal
          </Link>
        </div>
      </motion.div>
    );
  }

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
          Recovery Protocol
        </h1>
        <p className="text-[10px] text-slate-500 tracking-[0.25em] font-medium uppercase">
          Reset Security Credentials
        </p>
      </div>

      <p className="text-[11px] text-slate-400 mb-6 leading-relaxed text-center">
        Enter your neural address and we'll dispatch a recovery signal to reset your security key.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-center font-bold tracking-wide py-1 text-red-400"
            >
              {error}
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
          {loading ? 'Dispatching...' : <><LayoutGrid size={14} /> Send Recovery Signal</>}
        </motion.button>
      </form>

      {/* Back to Login */}
      <p className="text-center text-[10px] text-slate-500 mt-6 font-bold tracking-tighter uppercase">
        Remember your credentials?{' '}
        <Link href="/login" className="text-white font-black hover:text-cyan-400 transition-colors">
          Access Portal
        </Link>
      </p>
    </motion.div>
  );
}
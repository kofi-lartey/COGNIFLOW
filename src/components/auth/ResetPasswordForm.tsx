'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, LayoutGrid, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Security keys do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Security key must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Neural Link Configuration Missing');
      setLoading(false);
      return;
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
    setLoading(false);
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
            Security Key Reset
          </h1>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Your credentials have been updated successfully. Redirecting you to the access portal...
          </p>
        </div>

        <div className="w-full h-11 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center">
          <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-[0.15em]">
            Redirecting...
          </span>
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
          New Security Key
        </h1>
        <p className="text-[10px] text-slate-500 tracking-[0.25em] font-medium uppercase">
          Establish New Credentials
        </p>
      </div>

      <p className="text-[11px] text-slate-400 mb-6 leading-relaxed text-center">
        Enter your new security key below. This will replace your previous credentials.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">
            New Security Key
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new key"
              className="w-full h-11 pl-11 pr-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-slate-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">
            Confirm Security Key
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new key"
              className="w-full h-11 pl-11 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-slate-800"
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-[10px] text-red-400 font-bold">
                {error}
              </p>
            </motion.div>
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
          {loading ? 'Updating...' : <><LayoutGrid size={14} /> Establish New Key</>}
        </motion.button>
      </form>
    </motion.div>
  );
}
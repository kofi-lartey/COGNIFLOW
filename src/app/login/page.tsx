"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, UserPlus, Fingerprint, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#020617] text-slate-400 flex flex-col font-sans selection:bg-cyan-500/30">

      {/* 1. Slim Navigation */}
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

        <Link
          href="/register"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400 transition-all group"
        >
          <UserPlus size={14} className="group-hover:text-cyan-400" />
          Create Identity
        </Link>
      </motion.nav>

      {/* 2. Login Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Ambient background glow to match Register page */}
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Note: I'm assuming your <LoginForm /> contains the internal 
              card styling (bg-slate-900/40, etc.). 
              If not, wrap <LoginForm /> in the same motion.div styling 
              we used for the Register card.
          */}
          <LoginForm />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[10px] text-slate-600 mt-8 tracking-widest uppercase font-bold"
          >
            Authorized Personnel Only
          </motion.p>
        </motion.div>
      </main>

      {/* 3. Footer Status Bar */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        className="w-full py-4 px-8 flex justify-between items-center shrink-0 border-t border-slate-900/50"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-cyan-500" />
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase italic">Encrypted Session</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono tracking-tighter uppercase">Node: ACCRA-01</span>
          <div className="h-1 w-1 rounded-full bg-cyan-500 animate-pulse" />
        </div>
      </motion.footer>
    </div>
  );
}
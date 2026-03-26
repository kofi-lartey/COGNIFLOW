"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight, Globe, ShieldCheck, Fingerprint,
  Activity, Cpu, Menu, X
} from "lucide-react";

// --- NEURAL NETWORK WITH PULSE LOGIC ---
const NeuralNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const particleCount = 60;
    const connectionDistance = 140;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (dist < connectionDistance) {
            const isNearPulse = mousePos.current.active &&
              Math.sqrt((p.x - mousePos.current.x) ** 2 + (p.y - mousePos.current.y) ** 2) < 200;

            ctx.strokeStyle = `rgba(34, 211, 238, ${isNearPulse ? 0.35 : 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    const handleMouseDown = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      mousePos.current.active = true;
    };
    const handleMouseUp = () => (mousePos.current.active = false);

    window.addEventListener("resize", resize);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    resize(); createParticles(); draw();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const Typewriter = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <span className="font-mono text-cyan-500/80">
      {displayText}
      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-1.5 h-3 bg-cyan-500 ml-1 translate-y-[1px]" />
    </span>
  );
};

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  return (
    <div
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
      className="fixed inset-0 overflow-hidden bg-[#01040a] text-slate-400 flex flex-col font-sans selection:bg-cyan-500/30"
    >
      <NeuralNetwork />

      {/* Background Glow */}
      <motion.div
        className="absolute -inset-[300px] z-0 opacity-20 pointer-events-none hidden md:block"
        style={{ background: `radial-gradient(circle 400px at ${springX}px ${springY}px, rgba(6, 182, 212, 0.15), transparent 80%)` }}
      />

      {/* 1. Header */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 w-full shrink-0 border-b border-white/5 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Globe className="text-slate-950 w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base md:text-lg font-black tracking-tighter italic uppercase">CogniFlow</span>
            <span className="text-[7px] md:text-[8px] text-cyan-500/50 font-mono tracking-[0.4em] uppercase">Kernel_v.5</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em]">
          <Link href="/login" className="text-white hover:text-cyan-400 transition-colors">Portal_Access</Link>
          <Link href="/register" className="bg-cyan-500 text-slate-950 px-5 py-2 rounded-lg shadow-lg hover:brightness-110">Establish_Identity</Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </nav>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col items-center z-10 overflow-hidden">

        {/* Top Hero: Fixed height/padding to keep it stable */}
        <div className="text-center px-6 pt-8 md:pt-12 shrink-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full mb-4 md:mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[7px] md:text-[8px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]">Network_Sync: Verified</span>
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-black text-white mb-3 md:mb-4 tracking-tighter leading-[0.9] italic uppercase">
            Transcode <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600">Intelligence.</span>
          </h1>

          <div className="h-4 md:h-6 flex items-center justify-center mb-6 md:mb-8">
            <p className="text-[10px] md:text-xs font-medium max-w-xs md:max-w-lg leading-relaxed">
              <Typewriter text="Establishing neural link... Processing edge-AI synthesis protocols for local data decomposition." />
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link href="/register" className="w-full sm:w-auto bg-cyan-500 text-slate-950 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">
              Initialize_Link
            </Link>
            <button className="w-full sm:w-auto border border-slate-800 bg-slate-950/50 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-900 transition-all">
              Watch_Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview: Fills the remaining space */}
        <div className="w-full flex-1 flex flex-col justify-end px-4 md:px-10 mt-6 md:mt-8">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-6xl mx-auto h-full max-h-[40vh] md:max-h-[50vh] bg-slate-900/10 backdrop-blur-3xl rounded-t-[2rem] md:rounded-t-[3rem] border-t border-x border-cyan-500/20 shadow-[0_-20px_80px_rgba(6,182,212,0.1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-20 px-6 text-center">
              <Cpu className="w-8 h-8 text-cyan-500 animate-spin-slow" />
              <span className="text-[8px] font-mono tracking-[0.8em] uppercase text-cyan-500">Neural_Interface_Loading</span>
            </div>
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-cyan-500/20"
            />
          </motion.div>
        </div>
      </main>

      {/* 3. Footer: Now strictly visible */}
      <footer className="w-full py-3 md:py-4 px-6 md:px-10 flex justify-between items-center border-t border-white/5 bg-[#01040a] z-50 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-cyan-500" />
          <span className="text-[7px] md:text-[8px] font-mono tracking-[0.4em] uppercase text-slate-600">Secure_Core</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[7px] md:text-[8px] font-mono text-slate-800 uppercase tracking-widest hidden sm:inline">System_Active_100%</span>
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-pulse" />
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[100] bg-[#01040a] flex flex-col p-10 gap-10 font-black text-xs uppercase tracking-widest">
          <button className="self-end" onClick={() => setMobileMenu(false)}><X /></button>
          <Link href="/login" onClick={() => setMobileMenu(false)}>Portal_Access</Link>
          <Link href="/register" className="text-cyan-500" onClick={() => setMobileMenu(false)}>Establish_Identity</Link>
        </div>
      )}
    </div>
  );
}
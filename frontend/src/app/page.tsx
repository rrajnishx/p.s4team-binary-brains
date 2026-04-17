"use client";

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Satellite, Activity, ShieldCheck, MapPin } from 'lucide-react';
import CountUp from 'react-countup';

const ParticleBackground = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 5 + 5,
      yAnim: Math.random() * -100 - 50
    }));
    setParticles(generated);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent-green/30 rounded-full"
          initial={{
            x: p.x,
            y: p.y,
            opacity: p.opacity
          }}
          animate={{
            y: [null, p.yAnim],
            opacity: [null, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-green/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/10 blur-[150px]" />
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden font-body text-text-primary">
      <ParticleBackground />

      <main className="z-10 flex flex-col items-center max-w-5xl px-6 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-bg-card/50 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-sm font-medium text-text-muted">AWD Intelligence Dashboard v2.0</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Leaf className="w-12 h-12 text-accent-green drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <Satellite className="w-12 h-12 text-accent-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 font-heading">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-emerald-400 to-accent-cyan drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              AgroSense
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-2xl leading-relaxed">
            The next generation of climate-tech infrastructure. Simulate AI-powered Alternate Wetting and Drying compliance using precision satellite analytics.
          </p>

          <Link href="/analyze">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="relative group overflow-hidden flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold text-bg-primary bg-accent-green transition-all mb-20"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">Initialize Analysis <ArrowRight className="w-5 h-5" /></span>
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full mt-10">
          {[
            { label: "Farms Analyzed", value: 50, suffix: "K+", icon: MapPin },
            { label: "Methane Saved (kg)", value: 2.4, suffix: "M", icon: Activity, decimal: 1 },
            { label: "Active Satellites", value: 28, suffix: "", icon: Satellite },
            { label: "Model Accuracy", value: 99.2, suffix: "%", icon: ShieldCheck, decimal: 1 }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
              className="flex flex-col items-center glass-card p-6"
            >
              <stat.icon className="w-6 h-6 text-accent-cyan mb-4 opacity-70" />
              <div className="text-4xl font-bold text-text-primary data-font mb-1 flex items-baseline">
                <CountUp end={stat.value} decimals={stat.decimal || 0} duration={2.5} separator="," />
                <span className="text-xl text-accent-green ml-1">{stat.suffix}</span>
              </div>
              <div className="text-sm text-text-muted font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

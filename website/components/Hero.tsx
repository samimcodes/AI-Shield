'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  Terminal,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  SearchCheck,
} from 'lucide-react';

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const installCmd = 'npx @samimcodes/ai-shield init';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-emerald-600/15 to-indigo-600/20 blur-[130px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[120px] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-300 shadow-sm backdrop-blur-md mb-8 hover:border-cyan-400/50 transition-colors cursor-pointer">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Active Data Poisoning Middleware v0.1.0</span>
          <span className="text-cyan-500">•</span>
          <span className="font-semibold text-emerald-400">Production Ready</span>
        </div>

        {/* Punchy Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1] text-white">
          Stop AI Bots From Stealing Your Data.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Feed Them Poison Instead.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
          A drop-in middleware that serves synthetic garbage to scrapers with{' '}
          <span className="font-semibold text-emerald-400">HTTP 200 OK</span>, protecting your
          intellectual property while keeping SEO completely untouched.
        </p>

        {/* CTAs and Install Snippet */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <a
            href="#simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition-all"
          >
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Try Interactive Simulator</span>
          </a>
        </div>

        {/* 1-Line Copyable Install Snippet */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <span className="text-xs font-mono text-slate-500 select-none">$</span>
            <code className="text-xs sm:text-sm font-mono text-cyan-300 font-semibold">
              {installCmd}
            </code>
            <button
              onClick={copyToClipboard}
              className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Copy to clipboard"
              aria-label="Copy install command"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400 animate-in zoom-in" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Trust & Spec Metric Pills */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 border-t border-white/5">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold font-mono text-cyan-400">&lt; 1.8ms</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <Zap className="h-3.5 w-3.5 text-cyan-400" /> Edge Latency
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold font-mono text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <SearchCheck className="h-3.5 w-3.5 text-emerald-400" /> SEO Safety Guard
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold font-mono text-teal-400">200 OK</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> Stealth Poisoning
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold font-mono text-indigo-400">0 Tokens</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" /> Clean Intel Stolen
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

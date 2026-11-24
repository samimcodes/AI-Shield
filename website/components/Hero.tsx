'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  Play,
} from 'lucide-react';

export default function Hero() {
  const [url, setUrl] = useState('');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    'Probing robots.txt & AI crawler directives...',
    'Testing endpoint resistance to GPTBot, ClaudeBot & ByteSpider...',
    'Analyzing sitemap & API schema leakage...',
  ];

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanState('scanning');
    setScanStep(0);
  };

  useEffect(() => {
    if (scanState !== 'scanning') return;

    const timer1 = setTimeout(() => setScanStep(1), 1000);
    const timer2 = setTimeout(() => setScanStep(2), 2000);
    const timer3 = setTimeout(() => setScanState('completed'), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [scanState]);

  const cleanDomain = url.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'yourdomain.com';

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-grid-pattern radial-spotlight">
      {/* Background ambient gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-cyan-500/10 via-emerald-500/10 to-transparent blur-[140px] -z-10 pointer-events-none rounded-full" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3.5 py-1 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-zinc-200">Sub-2ms Lookup Latency</span>
          <span className="text-zinc-600">•</span>
          <span className="text-[#10B981] font-medium">100% SEO Safe</span>
        </div>

        {/* Punchy Linear-style Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          Stop AI Scrapers from Stealing Your Content.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-teal-300 to-[#10B981]">
            Automatically.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Stealthily block or poison unauthorized AI crawlers in under 2ms with a single line of code, while guaranteeing 100% SEO safety for Google & Bing.
        </p>

        {/* Dual Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <a
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-zinc-950 font-bold px-6 py-3.5 text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            <Shield className="h-4 w-4" />
            <span>Start Free Defense</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 hover:border-white/20 text-white font-medium px-6 py-3.5 text-sm transition-all shadow-sm backdrop-blur-md active:scale-[0.98]"
          >
            <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
            <span>Test Live Simulator</span>
          </a>
        </div>

        {/* Interactive Live Vulnerability Scanner Widget */}
        <div id="scanner" className="mt-12 max-w-2xl mx-auto text-left">
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-7 backdrop-blur-xl shadow-2xl">
            {/* Header / Label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#06B6D4]" />
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Instant Scraper Vulnerability Audit
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">Free • No install needed</span>
            </div>

            {/* Input Form */}
            {scanState !== 'completed' && (
              <form onSubmit={handleStartScan} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={scanState === 'scanning'}
                    placeholder="Enter website (e.g. acme.com or blog.dev)"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scanState === 'scanning' || !url.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06B6D4] hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-semibold px-6 py-3 text-sm transition-all shadow-sm shadow-cyan-500/20 active:scale-[0.98]"
                >
                  {scanState === 'scanning' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <span>Scan Site</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step animation during scan */}
            {scanState === 'scanning' && (
              <div className="mt-5 space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-cyan-400">{scanSteps[scanStep]}</span>
                  <span className="font-mono">{((scanStep + 1) * 33).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#10B981] transition-all duration-700 ease-out"
                    style={{ width: `${(scanStep + 1) * 33.3}%` }}
                  />
                </div>
              </div>
            )}

            {/* Completed Scan Results */}
            {scanState === 'completed' && (
              <div className="space-y-4 pt-1">
                {/* Result Summary Banner */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-200">
                      3 AI Scraper Vulnerabilities Exposed for {cleanDomain}
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                      Your robots.txt and headers do not protect against recursive LLM scrapers.
                    </p>
                  </div>
                </div>

                {/* Scraper Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">GPTBot</span>
                      <span className="text-[10px] text-red-400 font-mono">Vulnerable</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Full content extraction enabled</p>
                  </div>

                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">ByteSpider</span>
                      <span className="text-[10px] text-red-400 font-mono">Vulnerable</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">High-frequency scraping unthrottled</p>
                  </div>

                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">ClaudeBot</span>
                      <span className="text-[10px] text-red-400 font-mono">Vulnerable</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Automated knowledge ingestion</p>
                  </div>
                </div>

                {/* Mitigation & Action */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#10B981]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>100% Mitigated with AI-Shield Poisoning Engine</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setScanState('idle');
                        setUrl('');
                      }}
                      className="text-xs text-zinc-400 hover:text-white px-3 py-2 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                    <a
                      href="#pricing"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-4 py-2 text-xs transition-all shadow-sm shadow-cyan-500/25"
                    >
                      <span>Protect Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust & Performance Metrics Strip */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md hover:border-cyan-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">&lt; 1.8ms</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Edge Evaluation</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md hover:border-emerald-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-extrabold text-[#10B981] tracking-tight font-mono">100%</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">SEO Whitelisted</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md hover:border-cyan-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-extrabold text-[#06B6D4] tracking-tight font-mono">50+</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">AI Bots Covered</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md hover:border-purple-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-extrabold text-purple-400 tracking-tight font-mono">200 OK</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Stealth Poisoning</div>
          </div>
        </div>
      </div>
    </section>
  );
}

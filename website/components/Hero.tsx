'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Play,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';

export default function Hero() {
  const [url, setUrl] = useState('');
  const [copiedCli, setCopiedCli] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<{
    domain: string;
    reachable: boolean;
    robotsFound: boolean;
    hasAiShield: boolean;
    exposedBots: string[];
    blockedInRobots: string[];
    vulnerabilitiesCount: number;
  } | null>(null);
  const [scanError, setScanError] = useState('');

  const liveEvents = [
    { bot: 'GPTBot (OpenAI)', path: '/api/products', verdict: 'Poisoned (HTTP 200 OK)', latency: '1.2ms' },
    { bot: 'ClaudeBot (Anthropic)', path: '/blog/research-data', verdict: 'Poisoned (HTTP 200 OK)', latency: '0.9ms' },
    { bot: 'Googlebot (Verified)', path: '/pricing', verdict: 'SEO Pass-Through', latency: '0.4ms' },
    { bot: 'ByteSpider (TikTok)', path: '/docs/architecture', verdict: 'Quarantined', latency: '1.4ms' },
    { bot: 'PerplexityBot', path: '/api/v1/metrics', verdict: 'Poisoned (HTTP 200 OK)', latency: '1.1ms' },
  ];
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % liveEvents.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [liveEvents.length]);

  const scanSteps = [
    'Probing robots.txt & AI crawler directives...',
    'Testing endpoint resistance to GPTBot, ClaudeBot & ByteSpider...',
    'Analyzing HTTP headers & AI-Shield signatures...',
  ];

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanError('');
    setScanResult(null);
    setScanState('scanning');
    setScanStep(0);

    const stepTimer1 = setTimeout(() => setScanStep(1), 700);
    const stepTimer2 = setTimeout(() => setScanStep(2), 1400);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        setScanError(data.error || 'Could not scan domain.');
        setScanState('idle');
        return;
      }

      setScanResult(data);
      setScanState('completed');
    } catch {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setScanError('Network error while scanning target.');
      setScanState('idle');
    }
  };

  const cleanDomain = url.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'yourdomain.com';

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-grid-pattern radial-spotlight">
      {/* Background ambient lighting & floating orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-purple-500/10 blur-[150px] -z-10 pointer-events-none rounded-full animate-pulse-slow" />
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-cyan-500/10 blur-[120px] -z-10 pointer-events-none rounded-full animate-float" />
      <div className="absolute top-24 right-1/4 w-72 h-72 bg-emerald-500/10 blur-[120px] -z-10 pointer-events-none rounded-full animate-float" style={{ animationDelay: '2.5s' }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Top Badges: Live Intercept & Status */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3.5 py-1 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-zinc-200">Sub-2ms Lookup Latency</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#10B981] font-medium">100% SEO Safe</span>
          </div>

          {/* Dynamic Live Crawler Ticker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-zinc-900/90 px-3.5 py-1 text-xs text-zinc-300 shadow-md backdrop-blur-md transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Live Intercept:</span>
            <span className="font-semibold text-white text-[11px]">
              {liveEvents[currentEventIndex].bot}
            </span>
            <span className="text-zinc-600 font-mono text-[10px]">→</span>
            <span className="font-mono text-cyan-400 text-[11px]">
              {liveEvents[currentEventIndex].path}
            </span>
            <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {liveEvents[currentEventIndex].verdict}
            </span>
          </div>
        </div>

        {/* Punchy Linear-style Headline with Shimmer Animation */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          Stop AI Scrapers from Stealing Your Content.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-teal-200 via-emerald-400 to-[#06B6D4] animate-text-shimmer inline-block">
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-zinc-950 font-bold px-7 py-3.5 text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98] group"
          >
            <Shield className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Start Free Defense</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 hover:border-white/20 text-white font-medium px-6 py-3.5 text-sm transition-all shadow-sm backdrop-blur-md active:scale-[0.98] group"
          >
            <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20 transition-transform group-hover:scale-110" />
            <span>Test Live Simulator</span>
          </a>
        </div>

        {/* 1-Click Copyable CLI Install Pill (Vercel / Resend Style) */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText('npm i @samimcodes/ai-shield');
              setCopiedCli(true);
              setTimeout(() => setCopiedCli(false), 2000);
            }}
            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/90 hover:border-cyan-500/40 px-4 py-2 text-xs font-mono text-zinc-300 shadow-lg backdrop-blur-md transition-all cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5 text-[#06B6D4]" />
            <span>
              <span className="text-zinc-500 select-none">$ </span>
              npm i @samimcodes/ai-shield
            </span>
            <span className="pl-2 border-l border-white/10 text-zinc-400 group-hover:text-white flex items-center gap-1">
              {copiedCli ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span className="text-[#10B981] text-[11px]">Copied</span>
                </>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
        </div>

        {/* Ecosystem & Stack Compatibility Strip */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Drop-in protection for modern stacks
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs sm:text-sm font-semibold text-zinc-400">
            {['Next.js', 'Express.js', 'Node.js', 'Cloudflare', 'WordPress', 'Shopify'].map((stack) => (
              <span
                key={stack}
                className="hover:text-white transition-colors tracking-tight"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Live Vulnerability Scanner Widget with Border Beam */}
        <div id="scanner" className="mt-10 max-w-2xl mx-auto text-left border-beam rounded-2xl">
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/70 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Header / Label */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#06B6D4]" />
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Instant Scraper Vulnerability Audit
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                <span>Try:</span>
                {['vercel.com', 'openai.com'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setUrl(sample)}
                    className="text-cyan-400/80 hover:text-cyan-300 underline decoration-cyan-500/30 underline-offset-2 cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
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

            {scanError && (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300 text-left">
                {scanError}
              </div>
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
            {scanState === 'completed' && scanResult && (
              <div className="space-y-4 pt-1">
                {/* Result Summary Banner */}
                {scanResult.hasAiShield ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-200">
                        {scanResult.domain} is Protected by AI-Shield
                      </h4>
                      <p className="text-xs text-emerald-300/80 mt-0.5 leading-relaxed">
                        Active AI-Shield defense headers detected on this endpoint.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-200">
                        {scanResult.vulnerabilitiesCount} AI Scraper Exposures Found on {scanResult.domain}
                      </h4>
                      <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                        {scanResult.robotsFound
                          ? `robots.txt found, but ${scanResult.exposedBots.length} major AI crawlers are not actively poisoned.`
                          : 'No robots.txt directives or active AI-Shield poisoning headers detected.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Scraper Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {['GPTBot', 'ByteSpider', 'ClaudeBot'].map((bot) => {
                    const isBlocked =
                      scanResult.hasAiShield ||
                      scanResult.blockedInRobots.includes(bot);
                    return (
                      <div key={bot} className="p-3 rounded-lg border border-white/5 bg-zinc-950/60">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{bot}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isBlocked ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isBlocked ? 'Mitigated' : 'Exposed'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {isBlocked
                            ? 'Protected against unauthorized ingestion'
                            : 'Active stealth poisoning recommended'}
                        </p>
                      </div>
                    );
                  })}
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

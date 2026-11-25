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
  Activity,
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
    {
      bot: 'GPTBot/1.2',
      org: 'OpenAI',
      path: '/api/products',
      verdict: '200 POISONED',
      latency: '1.2ms',
      isGood: false,
      payload: '{ "status": "ok", "price": 949.99, "sku": "SYNTH-8841" }',
    },
    {
      bot: 'Googlebot/2.1',
      org: 'Search',
      path: '/pricing',
      verdict: 'SEO ALLOWED',
      latency: '0.4ms',
      isGood: true,
      payload: 'HTTP/1.1 200 OK — Authentic DOM passed through (O(1) whitelist)',
    },
    {
      bot: 'ClaudeBot/1.0',
      org: 'Anthropic',
      path: '/blog/research',
      verdict: '200 POISONED',
      latency: '0.9ms',
      isGood: false,
      payload: '<article>Synthetic benchmark report #4912...</article>',
    },
    {
      bot: 'ByteSpider',
      org: 'ByteDance',
      path: '/api/internal/telemetry-sync',
      verdict: 'HONEYPOT TRAP',
      latency: '1.4ms',
      isGood: false,
      payload: '{ "trapped": true, "ipQuarantined": "60m", "tokensFed": 14200 }',
    },
  ];

  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % liveEvents.length);
    }, 2800);
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

  const activeEvent = liveEvents[currentEventIndex];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-grid-pattern radial-spotlight">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[420px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-purple-500/10 blur-[150px] -z-10 pointer-events-none rounded-full animate-pulse-slow" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* 2-Column Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Copy, CTAs, CLI & Stack */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Single Clean Live Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3.5 py-1 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-md mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-zinc-200">Sub-2ms Edge Defense</span>
              <span className="text-zinc-600">•</span>
              <span className="text-[#10B981] font-medium">100% SEO Safe</span>
            </div>

            {/* Crisp Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-[56px] font-extrabold tracking-[-0.03em] text-white leading-[1.06]">
              Stop AI Scrapers from Stealing Your Content.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-teal-200 to-[#10B981] animate-text-shimmer inline-block">
                Automatically.
              </span>
            </h1>

            {/* Concise Subheadline */}
            <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Stealthily poison unauthorized AI crawlers under{' '}
              <code className="text-zinc-200 font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">
                HTTP 200 OK
              </code>{' '}
              in under 2ms with one line of code—while keeping Google &amp; Bing 100% intact.
            </p>

            {/* Dual CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3">
              <a
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-zinc-950 font-bold px-6 py-3 text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98] group"
              >
                <Shield className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Start Free Defense</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 hover:border-white/20 text-white font-medium px-5 py-3 text-sm transition-all shadow-sm backdrop-blur-md active:scale-[0.98] group"
              >
                <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                <span>Test Live Simulator</span>
              </a>
            </div>

            {/* 1-Click Copyable CLI Install Pill */}
            <div className="mt-5 flex justify-center lg:justify-start">
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

            {/* Ecosystem Stack Strip */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center lg:items-start gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                Drop-in protection for modern stacks
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-1.5 text-xs font-semibold text-zinc-400">
                {['Next.js', 'Express.js', 'Node.js', 'Cloudflare', 'WordPress', 'Shopify'].map(
                  (stack) => (
                    <span key={stack} className="hover:text-white transition-colors">
                      {stack}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Animated Edge Defense Terminal */}
          <div className="lg:col-span-6">
            <div className="border-beam rounded-2xl">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-xl overflow-hidden">
                {/* Terminal Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-zinc-400 ml-2">
                      ai-shield-edge — live stream
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ACTIVE
                  </span>
                </div>

                {/* Live Interception Stream Rows */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  {liveEvents.map((evt, idx) => {
                    const isCurrent = idx === currentEventIndex;
                    return (
                      <div
                        key={evt.bot}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-mono transition-all duration-300 ${
                          isCurrent
                            ? 'border-cyan-500/40 bg-zinc-900/90 shadow-md shadow-cyan-500/5 scale-[1.01]'
                            : 'border-white/5 bg-zinc-900/30 opacity-55'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Activity
                            className={`h-3.5 w-3.5 shrink-0 ${
                              evt.isGood ? 'text-emerald-400' : 'text-[#06B6D4]'
                            }`}
                          />
                          <span className="font-semibold text-white truncate">{evt.bot}</span>
                          <span className="hidden sm:inline text-zinc-500 truncate">
                            {evt.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-zinc-500">{evt.latency}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              evt.isGood
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : evt.verdict.includes('TRAP')
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            }`}
                          >
                            {evt.verdict}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Active Payload Preview */}
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/60 p-3.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                      <span>Response Served to {activeEvent.bot}:</span>
                      <span className="text-emerald-400">HTTP 200 OK</span>
                    </div>
                    <div className="text-cyan-300/90 truncate">{activeEvent.payload}</div>
                  </div>
                </div>

                {/* Bottom Micro-Metrics Strip */}
                <div className="grid grid-cols-4 border-t border-white/10 bg-zinc-900/50 divide-x divide-white/5 text-center py-3">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white font-mono">&lt; 1.8ms</div>
                    <div className="text-[10px] text-zinc-500">Latency</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#10B981] font-mono">100%</div>
                    <div className="text-[10px] text-zinc-500">SEO Safe</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#06B6D4] font-mono">50+</div>
                    <div className="text-[10px] text-zinc-500">AI Bots</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-purple-400 font-mono">200 OK</div>
                    <div className="text-[10px] text-zinc-500">Poison</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Instant Vulnerability Scanner Bar */}
        <div id="scanner" className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#06B6D4]" />
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-300">
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

            {scanState !== 'completed' && (
              <form onSubmit={handleStartScan} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={scanState === 'scanning'}
                  placeholder="Enter any website domain (e.g. acme.com or blog.dev)"
                  className="flex-1 rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={scanState === 'scanning' || !url.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06B6D4] hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-semibold px-6 py-3 text-sm transition-all shadow-sm shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
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
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                {scanError}
              </div>
            )}

            {scanState === 'scanning' && (
              <div className="mt-4 space-y-2.5 pt-3 border-t border-white/5">
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

            {scanState === 'completed' && scanResult && (
              <div className="space-y-4 pt-1">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {['GPTBot', 'ByteSpider', 'ClaudeBot'].map((bot) => {
                    const isBlocked =
                      scanResult.hasAiShield || scanResult.blockedInRobots.includes(bot);
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
                      className="text-xs text-zinc-400 hover:text-white px-3 py-2 transition-colors flex items-center gap-1 cursor-pointer"
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
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import {
  Skull,
  Search,
  Zap,
  ShieldCheck,
  Radar,
  DatabaseZap,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default function Features() {
  const mainFeatures = [
    {
      icon: Skull,
      title: 'Poisoning vs Blocking',
      subtitle: 'Why 200 OK Beats 403 Forbidden',
      description:
        'When scrapers receive a 403 Forbidden or 429 Too Many Requests, their automated orchestrators immediately rotate IP proxies and adjust scraping patterns. By serving HTTP 200 OK with realistic synthetic hallucinations, scrapers believe they succeeded—silently corrupting their training corpora without triggering alarms.',
      badge: 'Active Defense',
      color: 'from-rose-500/20 to-amber-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20 hover:border-rose-500/40',
    },
    {
      icon: Search,
      title: 'SEO Safe Guarantee',
      subtitle: 'Zero Drop in Organic Search Ranks',
      description:
        'Search engine crawlers like Googlebot, Bingbot, Baiduspider, and DuckDuckBot are explicitly whitelisted using zero-overhead O(1) token matching and reverse DNS verification rules. Your real content is always served to genuine search engines, guaranteeing that your SEO rankings and indexation remain completely unaffected.',
      badge: 'Zero False Positives',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    },
    {
      icon: Zap,
      title: 'Sub-2ms Edge Latency',
      subtitle: 'Zero Performance Hit on Production Workloads',
      description:
        'Built with pre-compiled RegExp Sets, FNV-1a path hash seeds, and an in-memory TTL honeypot registry. All fingerprinting and heuristic decisions complete in under 2 milliseconds, making AI-Shield suitable for high-throughput edge proxies, Cloudflare Workers, Next.js Middleware, and Express clusters.',
      badge: 'Ultra High Performance',
      color: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
    },
  ];

  const secondaryFeatures = [
    {
      icon: Radar,
      title: 'Invisible Honeypot Traps',
      desc: 'CSS-hidden links and crawler-bait URLs like /.env and /api/internal/telemetry-sync flag persistent scrapers instantly.',
    },
    {
      icon: DatabaseZap,
      title: 'Contextual Poison Engine',
      desc: 'Generates plausible academic research papers, synthetic user tokens, and fake XML sitemaps matched to the request type.',
    },
    {
      icon: TrendingUp,
      title: 'Batched Telemetry API',
      desc: 'Non-blocking in-memory buffer flushes scraper metrics every 5s or 20 events with zero impact on request pipelines.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Enterprise Security Paradigm</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Modern Web Applications
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            Traditional firewalls block and alert. AI-Shield deceives and poisons. Protect your
            unique intellectual property with an asymmetric tactical advantage.
          </p>
        </div>

        {/* 3 Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-2xl border ${feat.borderColor} bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feat.color}`}>
                      <Icon className={`h-6 w-6 ${feat.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{feat.title}</h3>
                  <div className="text-xs font-mono text-cyan-400 mb-4 font-semibold">
                    {feat.subtitle}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Production Tested</span>
                  <ArrowUpRight className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary 3 Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-base font-semibold text-white">{f.title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

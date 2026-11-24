'use client';

import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Comparison() {
  const rows = [
    {
      metric: 'HTTP Status Returned',
      traditional: '403 Forbidden / 429 Too Many Requests',
      aiShield: '200 OK (Clean Success)',
    },
    {
      metric: 'Scraper Reaction',
      traditional: 'Rotates proxies & tries new residential IP',
      aiShield: 'Logs success & ingests poisoned dataset',
    },
    {
      metric: 'Impact on AI Model Training',
      traditional: 'Zero (Bot operator retries elsewhere)',
      aiShield: 'Injects hallucinated contradictory facts',
    },
    {
      metric: 'Legitimate Search Engines (SEO)',
      traditional: 'At risk of accidental Cloudflare challenge blocks',
      aiShield: '100% Whitelisted (Google, Bing, DuckDuckGo)',
    },
    {
      metric: 'Compute & Edge Latency',
      traditional: 'High (Complex dynamic JS challenges & CAPTCHAs)',
      aiShield: 'Sub-2ms edge regex & in-memory IP cache',
    },
    {
      metric: 'Attacker Feedback Loop',
      traditional: 'Instant alarm triggered in scraper logs',
      aiShield: 'Zero alert — stealth asymmetric defense',
    },
  ];

  return (
    <section id="comparison" className="py-16 md:py-24 relative border-t border-white/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Tactical Asymmetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why 200 OK Poisoning Outperforms 403 Blocking
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Compare the operational reality of traditional web application firewalls against active data poisoning.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/80">
                  <th className="py-4 px-6 text-zinc-400 font-semibold">Security Strategy</th>
                  <th className="py-4 px-6 text-rose-400 font-semibold">Traditional WAF (403/429)</th>
                  <th className="py-4 px-6 text-cyan-400 font-bold bg-cyan-500/5 border-l border-white/10">
                    AI-Shield (200 OK Poison)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{row.metric}</td>
                    <td className="py-4 px-6 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-200 font-medium bg-cyan-500/[0.03] border-l border-white/10">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-white font-medium">{row.aiShield}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

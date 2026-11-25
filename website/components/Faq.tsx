'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Why does AI-Shield serve HTTP 200 OK poison instead of 403 Forbidden?',
    a: 'When scrapers receive a 403 Forbidden or 429 error, their orchestration scripts immediately rotate residential proxies and retry. By returning HTTP 200 OK with realistic synthetic content, scrapers believe the scrape succeeded—silently degrading their training datasets while stopping retry loops.',
  },
  {
    q: 'Will this affect my Google, Bing, or DuckDuckGo SEO rankings?',
    a: 'Never. Verified search engine crawlers (Googlebot, Bingbot, DuckDuckBot, Applebot, Baiduspider) are whitelisted in an O(1) lookup gate before any poisoning rules run. They always receive your authentic content with zero added latency.',
  },
  {
    q: 'Can I use AI-Shield if my website is on WordPress, Shopify, or Webflow?',
    a: 'Yes! While developers can install our @samimcodes/ai-shield npm package on Node.js, Express, Next.js, or Cloudflare Workers, non-Node websites can simply paste our 1-line <script> tag from the Dashboard into their site header.',
  },
  {
    q: 'What is the difference between the free npm package and the Pro Cloud plan?',
    a: 'The open-source npm package provides core local detection in memory. Upgrading to Pro ($7.99/mo) unlocks 500,000 monthly cloud validations, persistent Neon PostgreSQL telemetry, 50+ live updated bot signatures, dynamic synthetic hallucinations, and multi-key management.',
  },
  {
    q: 'Can I cancel anytime or get a refund?',
    a: 'Yes. Subscriptions are billed through Polar.sh with 1-click cancellation in the Customer Portal and a 14-day hassle-free money-back guarantee.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-24 relative border-t border-white/5">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#06B6D4]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
